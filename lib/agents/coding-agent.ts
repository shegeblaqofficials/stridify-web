import {
  ToolLoopAgent,
  stepCountIs,
  InferAgentUIMessage,
  type ModelMessage,
  tool,
} from "ai";
import type { Sandbox } from "@vercel/sandbox";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import {
  createDesignPageTool,
  createEditSandboxTool,
  createEditContentTool,
  createGenerateImageTool,
  type SubagentUsageTracker,
} from "./subagent-tools";

/** Max characters to keep in a tool-result output from older messages. */
const TOOL_OUTPUT_TRUNCATE_LIMIT = 300;

/**
 * Skill metadata extracted from SKILL.md frontmatter
 */
export interface SkillMetadata {
  name: string;
  description: string;
  path: string;
}

/**
 * Parse YAML-like frontmatter from SKILL.md files
 * Extracts name and description from --- ... --- block
 */
function parseFrontmatter(
  content: string,
): { name: string; description: string } | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return null;

  const frontmatter = match[1];
  const nameMatch = frontmatter.match(/name:\s*(.+?)(?:\n|$)/);
  const descMatch = frontmatter.match(/description:\s*(.+?)(?:\n|$)/);

  if (!nameMatch || !descMatch) return null;

  // Strip surrounding quotes (single or double) from YAML values
  const stripQuotes = (s: string) => s.replace(/^["'](.+)["']$/, "$1").trim();

  return {
    name: stripQuotes(nameMatch[1].trim()),
    description: stripQuotes(descMatch[1].trim()),
  };
}

/**
 * Strip YAML frontmatter from SKILL.md content
 * Returns only the markdown body
 */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? content.slice(match[0].length).trim() : content.trim();
}

/**
 * Recursively collect all files in a skill directory for syncing into sandbox.
 * Returns relative paths and Buffer contents.
 */
async function collectSkillFiles(
  skillDir: string,
): Promise<{ relativePath: string; content: Buffer }[]> {
  const files: { relativePath: string; content: Buffer }[] = [];

  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        const content = await fs.readFile(fullPath);
        files.push({
          relativePath: path.relative(skillDir, fullPath),
          content: Buffer.from(content),
        });
      }
    }
  }

  await walk(skillDir);
  return files;
}

/**
 * Discover available skills by scanning skill directories on the host filesystem.
 * Skills live in the web app repo (.agents/skills/), not inside the sandbox.
 * Returns only name and description (body loaded on-demand).
 */
async function discoverSkills(
  directories?: string[],
): Promise<SkillMetadata[]> {
  const defaultDirs = [path.join(process.cwd(), ".agents", "skills")];
  const dirs = directories ?? defaultDirs;
  const skills: SkillMetadata[] = [];
  const seenNames = new Set<string>();

  for (const dir of dirs) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const skillDir = path.join(dir, entry.name);
        const skillFile = path.join(skillDir, "SKILL.md");

        try {
          const content = await fs.readFile(skillFile, "utf-8");
          const frontmatter = parseFrontmatter(content);

          if (!frontmatter) continue;

          // First skill with a given name wins (allows project overrides)
          if (seenNames.has(frontmatter.name)) continue;

          seenNames.add(frontmatter.name);
          skills.push({
            name: frontmatter.name,
            description: frontmatter.description,
            path: skillDir,
          });
        } catch {
          // Skip skills without valid SKILL.md
          continue;
        }
      }
    } catch {
      // Skip directories that don't exist or can't be read
      continue;
    }
  }

  return skills;
}

/**
 * Build the skills section of the system prompt
 * Lists all discovered skills so agent knows what's available
 */
function buildSkillsPrompt(skills: SkillMetadata[]): string {
  if (skills.length === 0) return "";

  const skillsList = skills
    .map((s) => `- **${s.name}**: ${s.description}`)
    .join("\n");

  return `## Skills

Use the \`loadSkill\` tool to load a skill when the user's request matches a skill description.
The tool returns the skill's instructions and a \`skillDirectory\` path — use it to construct full paths
to bundled resources (e.g. \`\${skillDirectory}/assets/template.tsx\`) that you can read with your other tools.

Available skills:
${skillsList}`;
}

/**
 * Compact older model messages by truncating large tool outputs.
 * Keeps the last `keepRecentMessages` messages untouched so the model
 * has full context for the current task, while older tool results
 * are trimmed to save input tokens.
 */
function compactMessages(
  messages: ModelMessage[],
  keepRecentMessages = 6,
): ModelMessage[] {
  if (messages.length <= keepRecentMessages) return messages;

  const cutoff = messages.length - keepRecentMessages;

  return messages.map((msg, idx) => {
    if (idx >= cutoff) return msg;
    if (msg.role !== "tool") return msg;

    return {
      ...msg,
      content: msg.content.map((part) => {
        if (part.type !== "tool-result") return part;

        const output = part.output;
        if (!output) return part;

        if (
          output.type === "text" &&
          output.value.length > TOOL_OUTPUT_TRUNCATE_LIMIT
        ) {
          return {
            ...part,
            output: {
              ...output,
              value:
                output.value.slice(0, TOOL_OUTPUT_TRUNCATE_LIMIT) +
                "\n... [truncated]",
            },
          };
        }

        if (output.type === "json") {
          const str = JSON.stringify(output.value);
          if (str.length > TOOL_OUTPUT_TRUNCATE_LIMIT) {
            return {
              ...part,
              output: {
                type: "text" as const,
                value:
                  str.slice(0, TOOL_OUTPUT_TRUNCATE_LIMIT) +
                  "\n... [truncated]",
              },
            };
          }
        }

        return part;
      }),
    };
  });
}

const ORCHESTRATOR_INSTRUCTIONS = `You are a senior engineering lead that orchestrates specialized agents to build and modify Next.js applications in a sandbox environment.
You do NOT write code directly. Instead, you analyze the user's request, break it into clear tasks, and delegate each task to the most appropriate specialized agent.

## Your Specialized Agents
1. **designPage** — Creative design agent (powerful model). Use for:
   - Creating new pages or major components from scratch
   - Complex UI layouts and designs
   - Full page redesigns or new feature UIs
   - Any task requiring strong design sensibility

2. **editSandbox** — Sandbox operations agent. Use for:
   - Installing npm packages (pnpm add ...)
   - Running shell commands
   - Exploring the filesystem
   - Debugging build errors or runtime issues
   - Configuration changes (next.config, tsconfig, etc.)

3. **editContent** — Content editor agent. Use for:
   - Updating text, headings, descriptions, labels
   - Changing colors, spacing, typography
   - Minor CSS/Tailwind adjustments
   - Small targeted edits to existing files

4. **generateImage** — Image generation agent. Use for:
   - Creating custom images, photos, illustrations for the website
   - Generating hero backgrounds, product images, icons
   - Any task requiring AI-generated visual assets

## Guidelines
- Analyze the user's request and determine which agent(s) to use.
- Plan the sequence of tasks needed to fulfill the request.
- Write clear, detailed task descriptions for each agent. Include file paths, specific requirements, and context.
- For complex requests, break them into sequential steps — e.g., first install packages, then create main page, then add images, ask user if you need to add other pages.
- **NEVER call the same agent twice in a single step.** Combine related work into one detailed task description per agent.
- When an agent reports back, verify the work was done correctly. If there are issues, delegate a fix.
- Keep your responses to the user concise. Summarize what was done.
- The project is at /vercel/sandbox with a dev server on port 3000 (hot-reload enabled).
- Build iteratively. Don't try to do everything in one massive delegation.`;

export interface AgentMessageMetadata {
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  balanceExhausted?: boolean;
}

export function createCodingAgent(
  sandbox: Sandbox,
  subagentUsageTracker: SubagentUsageTracker,
  skills: SkillMetadata[] = [],
) {
  /**
   * Load skill tool - reads SKILL.md from host fs, syncs skill directory
   * into the sandbox so the agent can access bundled resources.
   */
  const loadSkillTool = tool({
    description: "Load a skill to get specialized instructions and guidance",
    inputSchema: z.object({
      name: z.string().describe("The exact name of the skill to load"),
    }),
    execute: async ({ name }) => {
      const skill = skills.find(
        (s) => s.name.toLowerCase() === name.toLowerCase(),
      );
      if (!skill) {
        return {
          error: `Skill '${name}' not found. Available skills: ${skills.map((s) => s.name).join(", ")}`,
        };
      }

      try {
        // Read SKILL.md from host filesystem
        const skillFile = path.join(skill.path, "SKILL.md");
        const content = await fs.readFile(skillFile, "utf-8");
        const body = stripFrontmatter(content);

        // Sync skill directory into the sandbox so agent can read bundled assets
        const sandboxSkillDir = `/vercel/sandbox/.agents/skills/${skill.name}`;
        const filesToSync = await collectSkillFiles(skill.path);
        if (filesToSync.length > 0) {
          await sandbox.writeFiles(
            filesToSync.map((f) => ({
              path: `${sandboxSkillDir}/${f.relativePath}`,
              content: f.content,
            })),
          );
        }

        return {
          skillDirectory: sandboxSkillDir,
          skillName: skill.name,
          content: body,
        };
      } catch (error) {
        return {
          error: `Failed to load skill '${skill.name}': ${error instanceof Error ? error.message : String(error)}`,
        };
      }
    },
  });

  // Build instructions with discovered skills
  const skillsSection = buildSkillsPrompt(skills);
  const fullInstructions = skillsSection
    ? `${ORCHESTRATOR_INSTRUCTIONS}\n\n${skillsSection}`
    : ORCHESTRATOR_INSTRUCTIONS;

  return new ToolLoopAgent({
    model: openai("gpt-5.4-mini"),
    instructions: fullInstructions,
    tools: {
      designPage: createDesignPageTool(sandbox, subagentUsageTracker),
      editSandbox: createEditSandboxTool(sandbox, subagentUsageTracker),
      editContent: createEditContentTool(sandbox, subagentUsageTracker),
      generateImage: createGenerateImageTool(sandbox, subagentUsageTracker),
      // Only expose loadSkill when skills are available
      ...(skills.length > 0 ? { loadSkill: loadSkillTool } : {}),
    },
    providerOptions: {
      openai: { parallelToolCalls: false },
    },
    stopWhen: stepCountIs(10),
    prepareStep({ messages }) {
      return { messages: compactMessages(messages) };
    },
  });
}

export type CodingAgentUIMessage = InferAgentUIMessage<
  ReturnType<typeof createCodingAgent>
>;

export { discoverSkills };
