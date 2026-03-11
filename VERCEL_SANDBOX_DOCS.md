---
title: Vercel Sandbox
product: vercel
url: /docs/vercel-sandbox
type: conceptual
prerequisites: []
related:
  - /docs/vercel-sandbox/sdk-reference
  - /docs/vercel-sandbox/cli-reference
  - /docs/vercel-sandbox/concepts/authentication
  - /docs/vercel-sandbox/system-specifications
  - /docs/vercel-sandbox/concepts
summary: Vercel Sandbox allows you to run arbitrary code in isolated, ephemeral Linux VMs.
---

# Vercel Sandbox

[Vercel Sandbox](/sandbox) is an ephemeral compute primitive designed to safely run untrusted or user-generated code on Vercel. It supports dynamic, real-time workloads for AI agents, code generation, and developer experimentation.

Use sandboxes to:

- **Execute untrusted code safely**: Run AI agent output, user uploads, or third-party scripts without exposing your production systems.
- **Build interactive tools**: Create code playgrounds, AI-powered UI builders, or developer sandboxes.
- **Test in isolation**: Preview how user-submitted or agent-generated code behaves in a self-contained environment with access to logs, file edits, and live previews.
- **Run development servers**: Spin up and test applications with live previews.

## Using Vercel Sandbox

The [Sandbox SDK](/docs/vercel-sandbox/sdk-reference) is the recommended way to integrate Vercel Sandbox into your applications. It provides a programmatic interface to create sandboxes, run commands, and manage files.

- **[SDK](/docs/vercel-sandbox/sdk-reference)** (recommended): Use `@vercel/sandbox` for TypeScript to automate sandbox workflows in your code
- **[CLI](/docs/vercel-sandbox/cli-reference)**: Use the `sandbox` CLI for manual testing, agentic workflows, debugging, and one-off operations

## Authentication

Vercel Sandbox supports two authentication methods:

- **[Vercel OIDC tokens](/docs/vercel-sandbox/concepts/authentication#vercel-oidc-token-recommended)** (recommended): Vercel generates the OIDC token that it associates with your Vercel project. For local development, run `vercel link` and `vercel env pull` to get a development token. In production on Vercel, authentication is automatic.
- **[Access tokens](/docs/vercel-sandbox/concepts/authentication#access-tokens)**: Use access tokens when `VERCEL_OIDC_TOKEN` is unavailable, such as in external CI/CD systems or non-Vercel environments.

To learn more on each method, see [Authentication](/docs/vercel-sandbox/concepts/authentication) for complete setup instructions.

## System specifications

Sandboxes run on Amazon Linux 2023 with `node24`, `node22`, and `python3.13` runtimes available. The default runtime is `node24`. Each sandbox runs as the `vercel-sandbox` user with `sudo` access and a default working directory of `/vercel/sandbox`.

For detailed information about runtimes, available packages, and sudo configuration, see [System Specifications](/docs/vercel-sandbox/system-specifications).

## Features

- **[Isolation](/docs/vercel-sandbox/concepts#isolation-architecture)**: Each sandbox runs in a secure Firecracker microVM with its own filesystem and network. Run untrusted code without affecting production.
- **[Node.js and Python runtimes](/docs/vercel-sandbox/system-specifications#runtimes)**: Choose from `node24`, `node22`, or `python3.13` with full root access. [Install any package or binary you need](/kb/guide/how-to-install-system-packages-in-vercel-sandbox).
- **[Fast startup](/docs/vercel-sandbox/concepts#how-sandboxes-work)**: Sandboxes start in milliseconds, making them ideal for real-time user interactions and latency-sensitive workloads.
- **[Snapshotting](/docs/vercel-sandbox/concepts/snapshots)**: Save the state of a running sandbox to resume later. Skip dependency installation on subsequent runs.
- **[CLI and SDK](/docs/vercel-sandbox/sdk-reference)**: Manage sandboxes through the CLI or TypeScript/Python SDK. Automate sandbox workflows in your application.

## Resources

**Quickstart**: Create your first sandbox step by step. [Learn more →](/docs/vercel-sandbox/quickstart)

**Working with Sandbox**: Task-oriented guides for common operations. [Learn more →](/docs/vercel-sandbox/working-with-sandbox)

**Concepts**: Understand how sandboxes work under the hood. [Learn more →](/docs/vercel-sandbox/concepts)

**SDK Reference**: Full API documentation for TypeScript and Python. [Learn more →](/docs/vercel-sandbox/sdk-reference)

**CLI Reference**: Manage sandboxes from the command line. [Learn more →](/docs/vercel-sandbox/cli-reference)

**Pricing**: Review costs and resource limits. [Learn more →](/docs/vercel-sandbox/pricing)

**Sandbox Repo**: View the Sandbox repository on GitHub contained the SDK and CLI codebase. [Learn more →](https://github.com/vercel/sandbox)

---

---

title: Quickstart
product: vercel
url: /docs/vercel-sandbox/quickstart
type: conceptual
prerequisites:

- /docs/vercel-sandbox
  related:
- /docs/cli
- /docs/vercel-sandbox/concepts/authentication
- /docs/vercel-sandbox/working-with-sandbox
- /docs/vercel-sandbox/sdk-reference
- /docs/vercel-sandbox/cli-reference
  summary: Learn how to run your first code in a Vercel Sandbox.

---

# Quickstart

This guide shows you how to run your first code in a Vercel Sandbox.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- [Vercel CLI](/docs/cli) installed (`npm i -g vercel`)
- Node.js 22+ or Python 3.10+

- ### Set up your environment

  Create a new directory and connect it to a Vercel project. This is the recommended way to authenticate because the project handles secure [OIDC token authentication](/docs/vercel-sandbox/concepts/authentication) for you.

  When prompted, select **Create a new project**. The project doesn't need any code deployed. It needs to exist so Vercel can generate authentication tokens for you.

  Once linked, pull your environment variables to get an authentication token:

  ```bash filename="Terminal"
  vercel env pull
  ```

  This creates a `.env.local` file containing a token that the SDK uses to authenticate your requests. When you deploy to Vercel, token management happens automatically.

- ### Install the SDK

- ### Write your code

  Create a file that creates a sandbox and runs a command:

- ### Run it

  You should see: `Hello from Vercel Sandbox!`

  Sandboxes automatically stop after 5 minutes. To adjust this or manage running sandboxes, see [Working with Sandbox](/docs/vercel-sandbox/working-with-sandbox).

## What you just did

1. **Set up authentication**: Connected to a Vercel project and pulled credentials to enable sandbox creation.
2. **Created a sandbox**: Spun up an isolated Linux microVM.
3. **Ran a command**: Executed code inside the secure environment.

## Next steps

- [SDK Reference](/docs/vercel-sandbox/sdk-reference): Full API documentation for TypeScript and Python.
- [CLI Reference](/docs/vercel-sandbox/cli-reference): Manage sandboxes from the terminal.
- [Snapshots](/docs/vercel-sandbox/concepts/snapshots): Save sandbox state to skip setup on future runs.
- [Examples](/docs/vercel-sandbox/working-with-sandbox#examples): See real-world use cases.

---

[View full sitemap](/docs/sitemap)

---

title: Understanding Sandboxes
product: vercel
url: /docs/vercel-sandbox/concepts
type: conceptual
prerequisites:

- /docs/vercel-sandbox
  related:
- /docs/vercel-sandbox/cli-reference
- /docs/vercel-sandbox/sdk-reference
- /docs/vercel-sandbox/concepts/snapshots
- /docs/vercel-sandbox/concepts/firewall
- /docs/vercel-sandbox/quickstart
  summary: Learn how Vercel Sandboxes provide on-demand, isolated compute environments for running untrusted code, testing applications, and executing...

---

# Understanding Sandboxes

Vercel Sandboxes provide on-demand, isolated compute environments for running untrusted code, testing applications, executing AI-generated scripts, and more. Sandboxes are **temporary by design**.

## What is a sandbox?

A sandbox is a short-lived, isolated Linux environment that you create programmatically with the SDK or CLI. Think of it as a secure virtual machine that:

- Starts from a clean state (or snapshot) every time
- Uses Amazon Linux 2023 as the base image
- Has network access for installing packages and making API calls
- Automatically terminates after a configurable timeout
- Provides full root access to install any package or binary

Each sandbox includes configurable isolation:

- **Filesystem access**: A dedicated private filesystem that is destroyed when the sandbox stops.
- **Process isolation**: Kernel-level isolation ensures code cannot see or access processes in other sandboxes.
- **Network isolation**: Each sandbox has its own network namespace with controlled outbound access.

## Sandboxes vs containers

Unlike Docker containers, each sandbox runs in its own [Firecracker](https://firecracker-microvm.github.io/) microVM with a dedicated kernel. This provides stronger isolation than container-based solutions, which makes sandboxes ideal for running untrusted code.

| Aspect           | Docker containers                                         | Vercel Sandboxes                                               |
| :--------------- | :-------------------------------------------------------- | :------------------------------------------------------------- |
| **Isolation**    | Shares host kernel; relies on namespaces and cgroups      | Dedicated kernel per sandbox; full VM isolation                |
| **Security**     | Suitable for trusted code; container escapes are possible | Designed for untrusted code; microVM boundary prevents escapes |
| **Startup time** | Sub-second                                                | Milliseconds (Firecracker optimized for fast boot)             |
| **Use case**     | Packaging and deploying applications                      | Running arbitrary, untrusted code safely                       |

If you already use Docker images to define your environment, you can replicate that setup in a sandbox by installing the same packages using [`dnf` and your language's package manager](/kb/guide/how-to-install-system-packages-in-vercel-sandbox), or by taking a snapshot after initial setup.

## How sandboxes work

When you call `Sandbox.create()`, Vercel provisions a Firecracker microVM on its infrastructure. This microVM boots an Amazon Linux 2023 image with your specified runtime (Node.js or Python) pre-installed.

The sandbox runs on Vercel's global infrastructure, so you don't need to manage servers, scale capacity, or worry about availability. Sandboxes automatically provision in `iad1` region.

Here's what happens during the lifecycle:

1. **Provisioning**: Vercel allocates compute resources and boots the microVM. Resuming from a snapshot is even faster than starting a fresh sandbox.
2. **Running**: Your code executes inside the isolated environment. You can run commands, install packages, start servers, and interact with the filesystem.
3. **Stopping**: When the timeout expires or you call `stop()`, the microVM shuts down. All data in the filesystem is destroyed unless you took a snapshot.

Since sandboxes are stateless and ephemeral, they're ideal for workloads where you don't need data to persist between runs. For persistent storage, write data to external services like databases or object storage before the sandbox stops.

## Sandbox lifecycle

### Creating a sandbox

When you're ready to use a sandbox, you can either create a new one from scratch or use a saved snapshot of a sandbox you created previously. Using a snapshot is much faster than creating from scratch because it avoids reinstalling dependencies and repeating setup steps.

Think of it like the difference between booting a fresh OS install versus resuming from a saved state. A new sandbox gives you a clean slate; a snapshot gives you a pre-configured environment ready to go.

To create a sandbox, you can use the [CLI](/docs/vercel-sandbox/cli-reference) or the [SDK](/docs/vercel-sandbox/sdk-reference):

### Running commands

Once created, you can run commands inside the sandbox. Commands can run in blocking mode (wait for completion) or detached mode (return immediately).

### Stopping a sandbox

Sandboxes automatically stop after a timeout. The default timeout is 5 minutes.

Alternatively, you can stop them manually:

You can also stop sandboxes from the Vercel Dashboard by navigating to **Observability > Sandboxes** and clicking **Stop Sandbox**.

### Taking snapshots

Snapshots save the current state of a sandbox, including all installed packages and files. Use snapshots to skip setup time on subsequent runs, checkpoint long-running tasks, or share environments with teammates.

See [Snapshots](/docs/vercel-sandbox/concepts/snapshots) for complete documentation on creating, retrieving, and managing snapshots.

## Common use cases

Vercel Sandboxes are ideal for features that require secure, on-demand code execution:

| Pattern                         | Why use sandboxes?                                                              | Example                                                                          |
| :------------------------------ | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------- |
| **AI code interpreter**         | LLM-generated code can be unpredictable. Sandboxes ensure it runs in isolation. | An AI assistant that solves math problems by writing and running Python scripts. |
| **Clean test environments**     | Start fresh for every test run to avoid "works on my machine" issues.           | Running unit tests against a clean OS for every commit.                          |
| **Reproducible infrastructure** | Share identical snapshots of environments across teams.                         | A QA team spinning up an exact replica of a customer's environment.              |
| **Temporary debugging**         | Spin up a throwaway environment to inspect issues without risk.                 | Investigating a production issue by replicating the environment.                 |

### When not to use sandboxes

Sandboxes are ephemeral by design. They are **not** suitable for:

- **Permanent hosting**: If you need a server that stays up 24/7, use a traditional VM or Vercel Functions.
- **Persistent data**: Data in a sandbox is lost when it stops unless you [take a snapshot](/docs/vercel-sandbox/concepts/snapshots). Use external databases or storage for long-term persistence.

## Security model

Vercel Sandboxes are designed for running untrusted code safely.

### Isolation architecture

Sandboxes use [Firecracker](https://firecracker-microvm.github.io/) microVMs to provide strict isolation. Each sandbox runs in its own lightweight virtual machine with a dedicated kernel, ensuring that code in one sandbox cannot access or interfere with others or the underlying host system.

### Resource limits

Every sandbox comes with:

- A dedicated private filesystem
- Network namespace isolation
- Kernel-level process isolation
- Strict CPU, memory, and disk limits
- Automatic timeouts to prevent runaway processes

These limits prevent resource exhaustion and ensure fair usage across all sandboxes.

### Network access

Sandboxes can make outbound HTTP requests by default, so you can install packages from public registries like npm or PyPI. Exposed ports are accessible via a public URL, so be mindful of what services you run.

Internet access from the sandbox can be restricted through network policies defined by the users, as part of the [sandbox firewall](/docs/vercel-sandbox/concepts/firewall).

### Data privacy

Sandboxes run on Vercel's secure infrastructure, which maintains SOC 2 Type II certification. Since sandboxes are ephemeral, they do not persist data long-term. For specific data residency requirements, consult your plan details or compliance team.

## Next steps

- [Quickstart](/docs/vercel-sandbox/quickstart): Run your first sandbox.
- [Working with Sandbox](/docs/vercel-sandbox/working-with-sandbox): Task-oriented guides for common operations.
- [Authentication](/docs/vercel-sandbox/concepts/authentication): Configure SDK authentication.
- [Snapshots](/docs/vercel-sandbox/concepts/snapshots): Save and restore sandbox state.
- [SDK Reference](/docs/vercel-sandbox/sdk-reference): Full API documentation.
- [CLI Reference](/docs/vercel-sandbox/cli-reference): Manage sandboxes from the terminal.
- [Examples](/docs/vercel-sandbox/working-with-sandbox#examples): Real-world use cases and code samples.

---

---

title: Sandbox Authentication
product: vercel
url: /docs/vercel-sandbox/concepts/authentication
type: conceptual
prerequisites:

- /docs/vercel-sandbox/concepts
- /docs/vercel-sandbox
  related:
- /docs/accounts
- /docs/project-configuration/general-settings
- /docs/rest-api
  summary: Learn how to authenticate with Vercel Sandbox using OIDC tokens or access tokens.

---

# Sandbox Authentication

The Sandbox SDK supports two authentication methods: Vercel OIDC tokens (recommended) and access tokens.

## Vercel OIDC token (recommended)

The SDK uses Vercel OpenID Connect (OIDC) tokens when available.

**Local development**: Download a development token by connecting to a Vercel project:

```bash
vercel link
vercel env pull
```

This creates a `.env.local` file with a `VERCEL_OIDC_TOKEN`. The token expires after 12 hours, so run `vercel env pull` again if you see authentication errors.

**Production**: Vercel manages token expiration automatically when your code runs on Vercel.

## Access tokens

Use access tokens when `VERCEL_OIDC_TOKEN` is unavailable, such as in external CI/CD systems or non-Vercel environments.

You need:

- Your [Vercel team ID](/docs/accounts#find-your-team-id)
- Your [Vercel project ID](/docs/project-configuration/general-settings#project-id)
- A [Vercel access token](/docs/rest-api#creating-an-access-token) with access to the team

Set these as environment variables:

```bash
VERCEL_TEAM_ID=team_xxx
VERCEL_PROJECT_ID=prj_xxx
VERCEL_TOKEN=your_access_token
```

Then pass them to `Sandbox.create()`:

## Which method to use

| Scenario           | Recommended method               |
| ------------------ | -------------------------------- |
| Local development  | OIDC token via `vercel env pull` |
| Deployed on Vercel | OIDC token (automatic)           |
| External CI/CD     | Access token                     |
| Non-Vercel hosting | Access token                     |

---

---

title: Snapshots
product: vercel
url: /docs/vercel-sandbox/concepts/snapshots
type: conceptual
prerequisites:

- /docs/vercel-sandbox/concepts
- /docs/vercel-sandbox
  related:
- /docs/vercel-sandbox/sdk-reference
- /docs/vercel-sandbox/cli-reference
- /docs/vercel-sandbox/pricing
  summary: Save and restore sandbox state with snapshots for faster startups and environment sharing.

---

# Snapshots

Snapshots capture the state of a running sandbox, including the filesystem and installed packages. Use snapshots to skip setup time on subsequent runs.

## When to use snapshots

- **Faster startups**: Skip dependency installation by snapshotting after setup.
- **Checkpointing**: Save progress on long-running tasks.
- **Sharing environments**: Give teammates an identical starting point.

## Create a snapshot

Call `snapshot()` on a running sandbox:

> **💡 Note:** Once you create a snapshot, the sandbox shuts down automatically and becomes unreachable. You don't need to stop it afterwards.

## Create a sandbox from a snapshot

Pass the snapshot ID when creating a new sandbox:

## List snapshots

View all snapshots for your project:

## Retrieve an existing snapshot

Look up a snapshot by ID:

## Delete a snapshot

Remove snapshots you no longer need:

## Snapshot limits

- Snapshots expire after **30 days** by default
- You can define a custom expiration time or none at all when creating a snapshot. See the [SDK](/docs/vercel-sandbox/sdk-reference#sandbox.snapshot) and [CLI](/docs/vercel-sandbox/cli-reference#sandbox-snapshot) documentation for more details.
- See [Pricing and Limits](/docs/vercel-sandbox/pricing#snapshot-storage) for storage costs and limits

---

title: Sandbox firewall
product: vercel
url: /docs/vercel-sandbox/concepts/firewall
type: conceptual
prerequisites:

- /docs/vercel-sandbox/concepts
- /docs/vercel-sandbox
  related:
  []
  summary: Define network policies on sandboxes, preventing data exfiltration.

---

# Sandbox firewall

Network firewall allows users to restrict egress traffic from their sandbox. It is a critical tool to prevent data exfiltration.

## When to use network firewall

- **Protect user data**: Allow untrusted code to touch user-data without a risk of it getting exfiltrated.
- **Avoid malware injection**: Constrain package sources, or S3 buckets to access.
- **Dynamic policies for multi-step work**: Start with Internet access, get required data, lock access and start untrusted process.
- **Protect your credentials**: Untrusted code running within the sandbox cannot be trusted with credentials, but needs to authenticate to external services (e.g. AI Gateway).

## Network policies

Sandboxes can use three distinct modes, which can be updated at runtime, without restarting the process.

### `allow-all`

Default policy. This gives the sandbox unrestricted access to the public Internet.

Have the ability to install software packages, download dependencies and pull any data from external sources with the enhanced security model of sandboxes.

### `deny-all`

Most restrictive policy. Denies all outbound network access, including DNS.

This is useful to reduce the chance of data exfiltration when running untrusted code or an agent on private data.

### User-defined

Most specific policy, denying all traffic by default, while allowing users to get fine-grain control on their sandbox setup. Users can define:

- a list of domains to allow traffic to. Domain-based policies are easy to use and maintain fine-grain access control for services like S3 (per bucket) or behind virtual hosting (as Vercel). Wildcard support (`*`) allows easier management for complex websites.
- a list of address ranges to allow traffic to. Those ranges will not enforce per-domain rules, supporting non-encrypted traffic. This is recommended when using secure-compute to connect to your private network securely.
- a list of address ranges to deny traffic to. Those range will take precedence to block traffic. This is useful when using secure-compute, allowing Internet access to be granted while blocking internal network.

## Credentials brokering

Commands running in the sandbox often require authentication with external services, for instance code repositories or AI services. Providing API keys to those commands would risk abuse or exfiltration.
On the other hand, allowing access to a domain can allow data exfiltration if not restricting the permissions or sessions attached to it.

Credentials brokering allows the injection of credentials on egressing traffic, while ensuring those secrets never enter the sandbox scope, preventing exfiltration.

> **⚠️ Warning:** Only Pro and Enterprise users can define transformations, including for credentials brokering.

### TLS termination

In order to perform transformation within requests, the firewall needs to terminate TLS connections. Only connections targeting domains with defined transformation rules are terminated in the proxy.

A unique, per-sandbox CA is added to the system certificates. Standard environment variables are configured automatically to ensure compatibility with most clients.

## Sandbox creation

Policies can be defined on sandboxes on creation, ensuring they will never run without them.

## Live updates

Policies can be updated on running sandboxes, allowing for incremental restrictions.

For instance start by installing needed packages, downloading data, and then run untrusted code on it.
Without live updates the entire run would have to get Internet access (creating exfiltration risk), or multiple steps and sandboxes would be needed.

---

title: Sandbox SDK Reference
product: vercel
url: /docs/vercel-sandbox/sdk-reference
type: conceptual
prerequisites:

- /docs/vercel-sandbox
  related:
- /docs/vercel-sandbox/concepts/snapshots
- /docs/vercel-sandbox/concepts/firewall
- /docs/vercel-sandbox/working-with-sandbox
- /docs/vercel-sandbox/concepts/authentication
- /docs/vercel-sandbox/pricing
  summary: A comprehensive reference for the Vercel Sandbox SDK, which allows you to run code in a secure, isolated environment.

---

# Sandbox SDK Reference

The Vercel Sandbox Software Development Kit (SDK) lets you create ephemeral Linux microVMs on demand. Use it to evaluate user-generated code, run AI agent output safely, test services without touching production resources, or run reproducible integration tests that need a full Linux environment with sudo access.

## Prerequisites

Install the SDK:

<CodeBlock>
  <Code tab="pnpm">
    ```bash
    pnpm i @vercel/sandbox
    ```
  </Code>
  <Code tab="yarn">
    ```bash
    yarn i @vercel/sandbox
    ```
  </Code>
  <Code tab="npm">
    ```bash
    npm i @vercel/sandbox
    ```
  </Code>
  <Code tab="bun">
    ```bash
    bun i @vercel/sandbox
    ```
  </Code>
</CodeBlock>

After installation:

- Link your project and pull environment variables with `vercel link` and `vercel env pull` so the SDK can read a Vercel OpenID Connect (OIDC) token.
- Choose a runtime: `node24`, `node22`, or `python3.13`.

## Core classes

| Class                                       | What it does                                       | Example                                       |
| ------------------------------------------- | -------------------------------------------------- | --------------------------------------------- |
| [`Sandbox`](#sandbox-class)                 | Creates and manages isolated microVM environments  | `const sandbox = await Sandbox.create()`      |
| [`Command`](#command-class)                 | Handles running commands inside the sandbox        | `const cmd = await sandbox.runCommand()`      |
| [`CommandFinished`](#commandfinished-class) | Contains the result after a command completes      | Access `cmd.exitCode` and `cmd.stdout()`      |
| [`NetworkPolicy`](#networkpolicy-class)     | Defines firewall rules for sandbox traffic         | `Sandbox.create({networkPolicy: 'deny-all'})` |
| [`Snapshot`](#snapshot-class)               | Represents a saved sandbox state for fast restarts | `const snapshot = await sandbox.snapshot()`   |

### Basic workflow

```ts
// 1. Create a sandbox
const sandbox = await Sandbox.create({ runtime: "node24" });

// 2. Run a command - it waits for completion and returns the result
const result = await sandbox.runCommand("node", ["--version"]);

// 3. Check the result
console.log(result.exitCode); // 0
console.log(await result.stdout()); // v22.x.x
```

## Sandbox class

The `Sandbox` class gives you full control over isolated Linux microVMs. Use it to create new sandboxes, inspect active ones, stream command output, and shut everything down once your workflow is complete.

### Sandbox class accessors

#### `sandboxId`

Use `sandboxId` to identify the current microVM so you can reconnect to it later with `Sandbox.get()` or trace command history. Store this ID whenever your workflow spans multiple processes or retries so you can resume log streaming after a restart.

**Returns:** `string`.

```ts
console.log(sandbox.sandboxId);
```

#### `status`

The `status` accessor reports the lifecycle state of the sandbox so you can decide when to queue new work or perform cleanup. Poll this value when you need to wait for startup or confirm shutdown, and treat `failed` as a signal to create a new sandbox.

**Returns:** `"pending" | "running" | "stopping" | "stopped" | "failed"`.

```ts
console.log(sandbox.status);
```

#### `timeout`

`timeout` shows how many milliseconds remain before the sandbox stops automatically. Compare the remaining time against upcoming commands and call `sandbox.extendTimeout()` if the window is too short.

**Returns:** `number`.

```ts
console.log(sandbox.timeout);
```

#### `createdAt`

The `createdAt` accessor returns the date and time when the sandbox was created. Use this to track the sandbox age or calculate how long a sandbox has been running.

**Returns:** `Date`.

```ts
console.log(sandbox.createdAt);
```

#### `activeCpuUsageMs`

The `activeCpuUsageMs` accessor returns the amount of CPU used for this sandbox (in milliseconds). It is only available once the sandbox VM has stopped. Use this to track the billable CPU.

**Returns:** `number`.

```ts
console.log(sandbox.activeCpuUsageMs);
```

#### `networkUsage`

The `networkUsage` accessor returns the amount of network data used by this sandbox (in bytes). It is only available once the sandbox VM has stopped. Use this to track the billable data usage.

**Returns:** `{ingress: number, egress: number}`.

```ts
console.log(sandbox.networkUsage);
```

### Sandbox class static methods

#### `Sandbox.list()`

Use `Sandbox.list()` to enumerate sandboxes for a project, optionally filtering by time range or page size. Combine `since` and `until` with the pagination cursor and cache the last `pagination.next` value so you can resume after restarts without missing entries.

**Returns:** `Promise<Parsed<{ sandboxes: SandboxSummary[]; pagination: Pagination; }>>`.

| Parameter   | Type             | Required | Details                                   |
| ----------- | ---------------- | -------- | ----------------------------------------- |
| `projectId` | `string`         | No       | Project whose sandboxes you want to list. |
| `limit`     | `number`         | No       | Maximum number of sandboxes to return.    |
| `since`     | `number \| Date` | No       | List sandboxes created after this time.   |
| `until`     | `number \| Date` | No       | List sandboxes created before this time.  |
| `signal`    | `AbortSignal`    | No       | Cancel the request if necessary.          |

```ts
const {
  json: { sandboxes, pagination },
} = await Sandbox.list();
```

#### `Sandbox.create()`

`Sandbox.create()` launches a new microVM with your chosen runtime, source, and resource settings. Defaults to an empty workspace when no source is provided. Pass `source.depth` when cloning large repositories to shorten setup time.

**Returns:** `Promise<Sandbox>`.

| Parameter         | Type                     | Required | Details / Values                                                                                                                  |
| ----------------- | ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `source`          | `git`                    | No       | Clone a Git repository. `url`: string `username`: string `password`: string `depth`?: number `revision`?: string                  |
| `source`          | `tarball`                | No       | Mount a tarball. `url`: string                                                                                                    |
| `source`          | `snapshot`               | No       | Create from a snapshot. `snapshotId`: string                                                                                      |
| `resources.vcpus` | `number`                 | No       | Override CPU count (defaults to plan baseline).                                                                                   |
| `runtime`         | `string`                 | No       | Runtime image such as `"node24"`, `"node22"`, or `"python3.13"`.                                                                  |
| `ports`           | `number[]`               | No       | Ports to expose for `sandbox.domain()`.                                                                                           |
| `timeout`         | `number`                 | No       | Initial timeout in milliseconds.                                                                                                  |
| `networkPolicy`   | `NetworkPolicy`          | No       | Firewall rules applied to sandbox egress traffic (defaults to global Internet access).                                            |
| `env`             | `Record<string, string>` | No       | Default environment variables for commands run in this sandbox. Per-command `runCommand({ env })` values override these defaults. |
| `signal`          | `AbortSignal`            | No       | Cancel sandbox creation if needed.                                                                                                |

```ts
const sandbox = await Sandbox.create({
  runtime: "node24",
  networkPolicy: "deny-all",
  env: { NODE_ENV: "production" },
});
```

#### `Sandbox.get()`

`Sandbox.get()` rehydrates an active sandbox by ID so you can resume work or inspect logs. It throws if the sandbox no longer exists, so cache `sandboxId` only while the job is active and clear it once the sandbox stops.

**Returns:** `Promise<Sandbox>`.

| Parameter   | Type          | Required | Details                                |
| ----------- | ------------- | -------- | -------------------------------------- |
| `sandboxId` | `string`      | Yes      | Identifier of the sandbox to retrieve. |
| `signal`    | `AbortSignal` | No       | Cancel the request if necessary.       |

```ts
const sandbox = await Sandbox.get({ sandboxId });
```

### Sandbox class instance methods

#### `sandbox.getCommand()`

Call `sandbox.getCommand()` to retrieve a previously executed command by its ID, which is especially helpful after detached executions when you want to inspect logs later.

**Returns:** `Promise<Command>`.

| Parameter     | Type          | Required | Details                                 |
| ------------- | ------------- | -------- | --------------------------------------- |
| `cmdId`       | `string`      | Yes      | Identifier of the command to fetch.     |
| `opts.signal` | `AbortSignal` | No       | Cancel the lookup if it takes too long. |

```ts
const command = await sandbox.getCommand(cmdId);
```

#### `sandbox.runCommand()`

`sandbox.runCommand()` executes commands inside the microVM, either blocking until completion or returning immediately in detached mode. Use `detached: true` for long-running servers, stream output to local log handlers, and call `command.wait()` later for results.

**Returns:** `Promise<CommandFinished>` when `detached` is `false`; `Promise<Command>` when `detached` is `true`.

| Parameter         | Type                     | Required | Details                                            |
| ----------------- | ------------------------ | -------- | -------------------------------------------------- |
| `command`         | `string`                 | Yes      | Command to execute (string overload).              |
| `args`            | `string[]`               | No       | Arguments for the string overload.                 |
| `opts.signal`     | `AbortSignal`            | No       | Cancel the command (string overload).              |
| `params.cmd`      | `string`                 | Yes      | Command to execute when using the object overload. |
| `params.args`     | `string[]`               | No       | Arguments for the object overload.                 |
| `params.cwd`      | `string`                 | No       | Working directory for execution.                   |
| `params.env`      | `Record<string, string>` | No       | Additional environment variables.                  |
| `params.sudo`     | `boolean`                | No       | Run the command with sudo.                         |
| `params.detached` | `boolean`                | No       | Return immediately with a live `Command` object.   |
| `params.stdout`   | `Writable`               | No       | Stream standard output to a writable.              |
| `params.stderr`   | `Writable`               | No       | Stream standard error to a writable.               |
| `params.signal`   | `AbortSignal`            | No       | Cancel the command when using the object overload. |

```ts
const result = await sandbox.runCommand("node", ["--version"]);
```

#### `sandbox.mkDir()`

`sandbox.mkDir()` creates a directory in the sandbox filesystem before you write files or clone repositories. Paths are relative to `/vercel/sandbox` unless you provide an absolute path. Call this before `writeFiles()` when your target directory does not exist yet.

```ts
await sandbox.mkDir("assets");
```

| Parameter     | Type          | Required | Details               |
| ------------- | ------------- | -------- | --------------------- |
| `path`        | `string`      | Yes      | Directory to create.  |
| `opts.signal` | `AbortSignal` | No       | Cancel the operation. |

**Returns:** `Promise<void>`.

#### `sandbox.readFile()`

Use `sandbox.readFile()` to pull file contents from the sandbox to a `ReadableStream`. The promise resolves to `null` when the file does not exist. You can use [`sandbox.readFileToBuffer()`](#sandbox.readfiletobuffer) directly if you prefer receiving a `Buffer`.

```ts
const stream = await sandbox.readFile({ path: "package.json" });
```

| Parameter     | Type          | Required | Details                                   |
| ------------- | ------------- | -------- | ----------------------------------------- |
| `file.path`   | `string`      | Yes      | Path to the file inside the sandbox.      |
| `file.cwd`    | `string`      | No       | Base directory for resolving `file.path`. |
| `opts.signal` | `AbortSignal` | No       | Cancel the read operation.                |

**Returns:** `Promise<null | ReadableStream>`.

#### `sandbox.readFileToBuffer()`

Use `sandbox.readFileToBuffer()` to pull entire file contents from the sandbox to an in-memory buffer. The promise resolves to `null` when the file does not exist.

```ts
const buffer = await sandbox.readFileToBuffer({ path: "package.json" });
```

| Parameter     | Type          | Required | Details                                   |
| ------------- | ------------- | -------- | ----------------------------------------- |
| `file.path`   | `string`      | Yes      | Path to the file inside the sandbox.      |
| `file.cwd`    | `string`      | No       | Base directory for resolving `file.path`. |
| `opts.signal` | `AbortSignal` | No       | Cancel the read operation.                |

**Returns:** `Promise<null | Buffer>`.

#### `sandbox.downloadFile()`

Use `sandbox.downloadFile()` to pull file contents from the sandbox to a local destination. The promise resolves to the absolute destination path or `null` when the source file does not exist.

```ts
const dstPath = await sandbox.downloadFile(
  { path: "package.json", cwd: "/vercel/sandbox" },
  { path: "local-package.json", cwd: "/tmp" },
);
```

| Parameter             | Type          | Required | Details                                                          |
| --------------------- | ------------- | -------- | ---------------------------------------------------------------- |
| `src.path`            | `string`      | Yes      | Path to the file inside the sandbox.                             |
| `src.cwd`             | `string`      | No       | Base directory for resolving `src.path`.                         |
| `dst.path`            | `string`      | Yes      | Path to local destination.                                       |
| `dst.cwd`             | `string`      | No       | Base directory for resolving `dst.path`.                         |
| `opts.signal`         | `AbortSignal` | No       | Cancel the download operation.                                   |
| `opts.mkdirRecursive` | `boolean`     | No       | Create destination directories recursively if they do not exist. |

**Returns:** `Promise<null | string>`.

#### `sandbox.writeFiles()`

`sandbox.writeFiles()` uploads one or more files into the sandbox filesystem. Paths default to `/vercel/sandbox`; use absolute paths for custom locations and bundle related files into a single call to reduce round trips.

```ts
await sandbox.writeFiles([{ path: "hello.txt", content: Buffer.from("hi") }]);
```

| Parameter     | Type                                   | Required | Details                     |
| ------------- | -------------------------------------- | -------- | --------------------------- |
| `files`       | `{ path: string; content: Buffer; }[]` | Yes      | File descriptors to write.  |
| `opts.signal` | `AbortSignal`                          | No       | Cancel the write operation. |

**Returns:** `Promise<void>`.

#### `sandbox.domain()`

`sandbox.domain()` resolves a publicly accessible URL for a port you exposed during creation. It throws if the port is not registered to a route, so include the port in the `ports` array when creating the sandbox and cache the returned URL so you can share it quickly with collaborators.

```ts
const previewUrl = sandbox.domain(3000);
```

| Parameter | Type     | Required | Details                          |
| --------- | -------- | -------- | -------------------------------- |
| `p`       | `number` | Yes      | Port number declared in `ports`. |

**Returns:** `string`.

#### `sandbox.stop()`

Call `sandbox.stop()` to terminate the microVM and free resources immediately. It's safe to call multiple times; subsequent calls resolve once the sandbox is already stopped, so invoke it as soon as you collect artifacts to control costs.

```ts
// Trigger sandbox shutdown asynchronously
await sandbox.stop();

// Trigger sandbox shutdown synchronously.
const stoppedSandbox = await sandbox.stop({ blocking: true });
```

| Parameter       | Type          | Required | Details                                    |
| --------------- | ------------- | -------- | ------------------------------------------ |
| `opts.blocking` | `boolean`     | No       | Wait for the sandbox to be marked stopped. |
| `opts.signal`   | `AbortSignal` | No       | Cancel the stop operation.                 |

**Returns:** `Promise<Sandbox>`.

#### `sandbox.updateNetworkPolicy()`

Use `sandbox.updateNetworkPolicy()` to update the firewall settings applied to the sandbox egress traffic. The provided configuration fully replaces the pre-existing one. This allows for instance a user to start a sandbox, gather data, then run some untrusted program on it without risking data exfiltration.

```ts
await sandbox.updateNetworkPolicy("allow-all"); // Allow all egress from the sandbox

await sandbox.updateNetworkPolicy("deny-all"); // Block all egress from the sandbox

await sandbox.updateNetworkPolicy({
  allow: ["google.com", "ai-gateway.vercel.sh"],
}); // Allow traffic to specific websites only

// Allow traffic to specific websites and private network
await sandbox.updateNetworkPolicy({
  allow: ["google.com", "ai-gateway.vercel.sh"],
  subnets: {
    allow: ["10.0.0.0/8"],
  },
});

// Allow traffic to the Internet while blocking private network
await sandbox.updateNetworkPolicy({
  subnets: {
    deny: ["10.0.0.0/8"],
  },
});

// Allow traffic to a specific website with credential brokering
await sandbox.updateNetworkPolicy({
  allow: {
    "ai-gateway.vercel.sh": [
      {
        transform: [
          {
            headers: {
              "x-api-key": "secret-key",
            },
          },
        ],
      },
    ],
  },
});
```

| Parameter       | Type            | Required | Details                                                  |
| --------------- | --------------- | -------- | -------------------------------------------------------- |
| `networkPolicy` | `NetworkPolicy` | Yes      | New firewall setup. Will fully replace the existing one. |
| `opts.signal`   | `AbortSignal`   | No       | Cancel the operation.                                    |

**Returns:** `Promise<void>`.

#### `sandbox.extendTimeout()`

Use `sandbox.extendTimeout()` to extend the sandbox lifetime by the specified duration. This lets you keep the sandbox running up to the maximum execution timeout for your plan, so check `sandbox.timeout` first and extend only when necessary to avoid premature shutdown.

```ts
await sandbox.extendTimeout(60000); // Extend by 60 seconds
```

| Parameter     | Type          | Required | Details                                            |
| ------------- | ------------- | -------- | -------------------------------------------------- |
| `duration`    | `number`      | Yes      | Duration in milliseconds to extend the timeout by. |
| `opts.signal` | `AbortSignal` | No       | Cancel the operation.                              |

**Returns:** `Promise<void>`.

#### `sandbox.snapshot()`

Call `sandbox.snapshot()` to capture the current state of the sandbox, including the filesystem and installed packages. Use snapshots to skip lengthy setup steps when creating new sandboxes. To learn more, see [Snapshots](/docs/vercel-sandbox/concepts/snapshots).

The sandbox must be running to create a snapshot. Once you call this method, the sandbox shuts down automatically and becomes unreachable. You do not need to call `stop()` afterwards, and any subsequent commands to the sandbox will fail.

> **💡 Note:** Snapshots expire after 30 days by default. Set `expiration` to `0` to disable expiration,
> or choose a custom duration in milliseconds (e.g., `ms('14d')`) to fit your workflow.

```ts filename="index.ts"
const snapshot = await sandbox.snapshot({ expiration: ms("14d") });
console.log(snapshot.snapshotId);

// Later, create a new sandbox from the snapshot
const newSandbox = await Sandbox.create({
  source: { type: "snapshot", snapshotId: snapshot.snapshotId },
});
```

| Parameter         | Type          | Required | Details                                                                   |
| ----------------- | ------------- | -------- | ------------------------------------------------------------------------- |
| `opts.expiration` | `number`      | No       | Optional expiration time in milliseconds. Use 0 for no expiration at all. |
| `opts.signal`     | `AbortSignal` | No       | Cancel the operation.                                                     |

**Returns:** `Promise<Snapshot>`.

## Command class

`Command` instances represent processes that run inside a sandbox. Detached executions created through `sandbox.runCommand({ detached: true, ... })` return a `Command` immediately so that you can stream logs or stop the process later. Blocking executions that do not set `detached` still expose these methods through the `CommandFinished` object they resolve to.

### Command class properties

#### `exitCode`

The `exitCode` property holds the process exit status once the command finishes. For detached commands, this value starts as `null` and gets populated after you await `command.wait()`, so check for `null` to determine if the command is still running.

```ts
if (command.exitCode !== null) {
  console.log(`Command exited with code: ${command.exitCode}`);
}
```

**Returns:** `number | null`.

### Command class accessors

#### `cmdId`

Use `cmdId` to identify the specific command execution so you can look it up later with `sandbox.getCommand()`. Store this value whenever you launch detached commands so you can replay output in dashboards or correlate logs across systems.

```ts
console.log(command.cmdId);
```

**Returns:** `string`.

#### `cwd`

The `cwd` accessor shows the working directory where the command is executing. Compare this value against expected paths when debugging file-related issues or verifying that relative paths resolve correctly.

```ts
console.log(command.cwd);
```

**Returns:** `string`.

#### `startedAt`

`startedAt` returns the Unix timestamp (in milliseconds) when the command started executing. Subtract this from the current time to monitor execution duration or set timeout thresholds for long-running processes.

```ts
const duration = Date.now() - command.startedAt;
console.log(`Command has been running for ${duration}ms`);
```

**Returns:** `number`.

### Command class methods

#### `logs()`

Call `logs()` to stream structured log entries in real time so you can watch command output as it happens. Each entry includes the stream type (`stdout` or `stderr`) and the data chunk, so you can route logs to different destinations or stop iteration when you detect a readiness signal.

```ts
for await (const log of command.logs()) {
  if (log.stream === "stdout") {
    process.stdout.write(log.data);
  } else {
    process.stderr.write(log.data);
  }
}
```

| Parameter     | Type          | Required | Details                         |
| ------------- | ------------- | -------- | ------------------------------- |
| `opts.signal` | `AbortSignal` | No       | Cancel log streaming if needed. |

**Returns:** `AsyncGenerator<{ stream: "stdout" | "stderr"; data: string; }, void, void>`.

**Note:** May throw `StreamError` if the sandbox stops while streaming logs.

#### `wait()`

Use `wait()` to block until a detached command finishes and get the resulting `CommandFinished` object with the populated exit code. This method is essential for detached commands where you need to know when execution completes. For non-detached commands, `sandbox.runCommand()` already waits automatically.

```ts
const detachedCmd = await sandbox.runCommand({
  cmd: "sleep",
  args: ["5"],
  detached: true,
});
const result = await detachedCmd.wait();
if (result.exitCode !== 0) {
  console.error("Something went wrong...");
}
```

| Parameter       | Type          | Required | Details                                    |
| --------------- | ------------- | -------- | ------------------------------------------ |
| `params.signal` | `AbortSignal` | No       | Cancel waiting if you need to abort early. |

**Returns:** `Promise<CommandFinished>`.

#### `output()`

Use `output()` to retrieve stdout, stderr, or both as a single string. Choose `"both"` when you want combined output for logging, or specify `"stdout"` or `"stderr"` when you need to process them separately after the command finishes.

```ts
const combined = await command.output("both");
const stdoutOnly = await command.output("stdout");
```

| Parameter     | Type                             | Required | Details                    |
| ------------- | -------------------------------- | -------- | -------------------------- |
| `stream`      | `"stdout" \| "stderr" \| "both"` | Yes      | The output stream to read. |
| `opts.signal` | `AbortSignal`                    | No       | Cancel output streaming.   |

**Returns:** `Promise<string>`.

**Note:** This may throw string conversion errors if the command output contains invalid Unicode.

#### `stdout()`

`stdout()` collects the entire standard output stream as a string, which is handy when commands print JSON or other structured data that you need to parse after completion.

```ts
const output = await command.stdout();
const data = JSON.parse(output);
```

| Parameter     | Type          | Required | Details                                 |
| ------------- | ------------- | -------- | --------------------------------------- |
| `opts.signal` | `AbortSignal` | No       | Cancel the read while the command runs. |

**Returns:** `Promise<string>`.

**Note:** This may throw string conversion errors if the command output contains invalid Unicode.

#### `stderr()`

`stderr()` gathers all error output produced by the command. Combine this with `exitCode` to build user-friendly error messages or forward failure logs to your monitoring system.

```ts
const errors = await command.stderr();
if (errors) {
  console.error("Command errors:", errors);
}
```

| Parameter     | Type          | Required | Details                                        |
| ------------- | ------------- | -------- | ---------------------------------------------- |
| `opts.signal` | `AbortSignal` | No       | Cancel the read while collecting error output. |

**Returns:** `Promise<string>`.

**Note:** This may throw string conversion errors if the command output contains invalid Unicode.

#### `kill()`

Call `kill()` to terminate a running command using the specified signal. This lets you stop long-running processes without destroying the entire sandbox. Send `SIGTERM` by default for graceful shutdown, or use `SIGKILL` for immediate termination.

```ts
await command.kill("SIGKILL");
```

| Parameter          | Type          | Required | Details                                                   |
| ------------------ | ------------- | -------- | --------------------------------------------------------- |
| `signal`           | `Signal`      | No       | The signal to send to the process. Defaults to `SIGTERM`. |
| `opts.abortSignal` | `AbortSignal` | No       | Cancel the kill operation.                                |

**Returns:** `Promise<void>`.

## CommandFinished class

`CommandFinished` is the result you receive after a sandbox command exits. It extends the `Command` class, so you keep access to streaming helpers such as `logs()` or `stdout()`, but you also get the final exit metadata immediately. You usually receive this object from `sandbox.runCommand()` or by awaiting `command.wait()` on a detached process.

### CommandFinished class properties

#### `exitCode`

The `exitCode` property reports the numeric status returned by the command. A value of `0` indicates success; any other value means the process exited with an error, so branch on it before you parse output.

```ts
if (result.exitCode === 0) {
  console.log("Command succeeded");
}
```

**Returns:** `number`.

### CommandFinished class accessors

#### `cmdId`

Use `cmdId` to identify the specific command execution so you can reference it in logs or retrieve it later with `sandbox.getCommand()`. Store this ID whenever you need to trace command history or correlate output across retries.

```ts
console.log(result.cmdId);
```

**Returns:** `string`.

#### `cwd`

The `cwd` accessor shows the working directory where the command executed. Compare this value against expected paths when debugging file-related failures or relative path issues.

```ts
console.log(result.cwd);
```

**Returns:** `string`.

#### `startedAt`

`startedAt` returns the Unix timestamp (in milliseconds) when the command started executing. Subtract this from the current time or from another timestamp to measure execution duration or schedule follow-up tasks.

```ts
const duration = Date.now() - result.startedAt;
console.log(`Command took ${duration}ms`);
```

**Returns:** `number`.

### CommandFinished class methods

`CommandFinished` inherits all methods from `Command` including `logs()`, `output()`, `stdout()`, `stderr()`, and `kill()`. See the [Command class](#command-class) section for details on these methods.

## NetworkPolicy class

`NetworkPolicy` instances represent the firewall setup of the sandbox. To learn more, see [network firewall](/docs/vercel-sandbox/concepts/firewall).

### Base modes

#### `allow-all`

The `allow-all` mode is the default applicable policy for sandboxes. It allows all egress traffic, to the Internet and secure-compute environments.

#### `deny-all`

The `deny-all` mode can be set to restrict sandbox network access. It blocks all egress traffic, including DNS resolution.

### User-defined rules

#### `allow`

The `allow` property allows the user to provide a list of website or API domains to allow access to.
Traffic identification is based on SNI (server-name indicator), hence only TLS traffic is currently supported.
Matching is based on:

- if the domain does not contain any wildcard `*` segment, only exact matches are accepted.
- if the domain includes a wildcard `*` as a middle segment (e.g. `www.*.com`), it only matches this one segment.
- if the domain starts with a wildcard `*` (e.g. `*.google.com`), any subdomain is matched. It will not match the parent domain (e.g. `google.com` here).

Encryption is not intercepted if no transformation rules are defined, allowing end-to-end data confidentiality.

##### `transform`

The `allow` property can be set as an object providing the websites to allow traffic to, with optional additional transformation rules.
When such rules are defined, encryption is intercepted to allow request alteration.

Currently supported transformation is header injection, overriding the provided header with the value set, implementing [credential brokering](/docs/vercel-sandbox/concepts/firewall#credentials-brokering).

> **⚠️ Warning:** Only Pro and Enterprise users can define transformations.

#### `subnets.allow`

`subnets.allow` allows the user to provide a list of address ranges to allow traffic to.
If used in combination with `allow`, traffic to those addresses will also bypass domain matching.

It enables users to enable traffic not using TLS, or towards systems where domains cannot be used.
Beware of virtual hosting providers which can host many websites behind a given address.

#### `subnets.deny`

`subnets.deny` allows the user to provide a list of address ranges to deny traffic to.
Those ranges will always take precedence over `subnets.allow` and domain-based `allow` entries.

It allows the user to deny access to part of their network for instance while allowing access to the Internet in general.

## Snapshot class

A `Snapshot` represents a saved state of a sandbox that you can use to create new sandboxes. Snapshots capture the filesystem, installed packages, and environment configuration, letting you skip setup steps and start new sandboxes faster. To learn more, see [Snapshots](/docs/vercel-sandbox/concepts/snapshots).

Create snapshots with `sandbox.snapshot()` or retrieve existing ones with `Snapshot.get()`.

### Snapshot class accessors

#### `snapshotId`

Use `snapshotId` to identify the snapshot when creating new sandboxes or retrieving it later. Store this ID to reuse the snapshot across multiple sandbox instances.

**Returns:** `string`.

```ts filename="index.ts"
console.log(snapshot.snapshotId);
```

#### `sourceSandboxId`

The `sourceSandboxId` accessor returns the ID of the sandbox that produced this snapshot. Use this to trace the origin of a snapshot or correlate it with sandbox logs.

**Returns:** `string`.

```ts filename="index.ts"
console.log(snapshot.sourceSandboxId);
```

#### `status`

The `status` accessor reports the current state of the snapshot. Check this value to confirm the snapshot creation succeeded before using it.

**Returns:** `"created" | "deleted" | "failed"`.

```ts filename="index.ts"
console.log(snapshot.status);
```

#### `sizeBytes`

The `sizeBytes` accessor returns the size of the snapshot in bytes. Use this to monitor storage usage.

**Returns:** `number`.

```ts
console.log(snapshot.sizeBytes);
```

#### `createdAt`

The `createdAt` accessor returns the date and time when the snapshot was created.

**Returns:** `Date`.

```ts
console.log(snapshot.createdAt);
```

#### `expiresAt`

The `expiresAt` accessor returns the date and time when the snapshot will automatically expire and be deleted. If the snapshot was created with `expiration: 0`, this value is `null`.

**Returns:** `Date | null`.

```ts
if (snapshot.expiresAt) {
  console.log(snapshot.expiresAt.toISOString());
}
```

### Snapshot class static methods

#### `Snapshot.list()`

Use `Snapshot.list()` to enumerate snapshots for a project, with the option to filter by time range or page size. To resume after restarts without missing entries, combine `since` and `until` with the pagination cursor and cache the last `pagination.next` value.

**Returns:** `Promise<Parsed<{ snapshots: SnapshotSummary[]; pagination: Pagination; }>>`.

| Parameter   | Type             | Required | Details                                   |
| ----------- | ---------------- | -------- | ----------------------------------------- |
| `projectId` | `string`         | No       | Project whose snapshots you want to list. |
| `limit`     | `number`         | No       | Maximum number of snapshots to return.    |
| `since`     | `number \| Date` | No       | List snapshots created after this time.   |
| `until`     | `number \| Date` | No       | List snapshots created before this time.  |
| `signal`    | `AbortSignal`    | No       | Cancel the request if necessary.          |

```ts
const {
  json: { snapshots, pagination },
} = await Snapshot.list();
```

#### `Snapshot.get()`

Use `Snapshot.get()` to retrieve an existing snapshot by its ID.

**Returns:** `Promise<Snapshot>`.

| Parameter    | Type          | Required | Details                                 |
| ------------ | ------------- | -------- | --------------------------------------- |
| `snapshotId` | `string`      | Yes      | Identifier of the snapshot to retrieve. |
| `signal`     | `AbortSignal` | No       | Cancel the request if necessary.        |

```ts filename="index.ts"
import { Snapshot } from "@vercel/sandbox";

const snapshot = await Snapshot.get({ snapshotId: "snap_abc123" });
console.log(snapshot.status);
```

### Snapshot class instance methods

#### `snapshot.delete()`

Call `snapshot.delete()` to remove a snapshot you no longer need. Deleting unused snapshots helps manage storage and keeps your snapshot list organized.

**Returns:** `Promise<void>`.

| Parameter     | Type          | Required | Details               |
| ------------- | ------------- | -------- | --------------------- |
| `opts.signal` | `AbortSignal` | No       | Cancel the operation. |

```ts filename="index.ts"
await snapshot.delete();
```

## Example workflows

- [Install system packages](/kb/guide/how-to-install-system-packages-in-vercel-sandbox) while keeping sudo-enabled commands isolated.
- [Execute long-running tasks](/docs/vercel-sandbox/working-with-sandbox#execute-long-running-tasks) by extending sandbox timeouts for training or large dependency installs.
- Browse more scenarios in the [Sandbox examples](/docs/vercel-sandbox/working-with-sandbox#examples) catalog.

## Authentication

Vercel Sandbox supports two authentication methods:

- **[Vercel OIDC tokens](/docs/vercel-sandbox/concepts/authentication#vercel-oidc-token-recommended)** (recommended): Vercel generates the OIDC token that it associates with your Vercel project. For local development, run `vercel link` and `vercel env pull` to get a development token. In production on Vercel, authentication is automatic.
- **[Access tokens](/docs/vercel-sandbox/concepts/authentication#access-tokens)**: Use access tokens when `VERCEL_OIDC_TOKEN` is unavailable, such as in external CI/CD systems or non-Vercel environments.

To learn more on each method, see [Authentication](/docs/vercel-sandbox/concepts/authentication) for complete setup instructions.

## Environment defaults

- **Operating system:** Amazon Linux 2023 with common build tools such as `git`, `tar`, `openssl`, and `dnf`.
- **Available runtimes:** `node24`, `node22`, and `python3.13` images with their respective package managers.
- **Resources:** Choose the number of virtual CPUs (`vcpus`) per sandbox. Pricing and plan limits appear in the [Sandbox pricing table](/docs/vercel-sandbox/pricing#resource-limits).
- **Timeouts:** The default timeout is 5 minutes. You can extend it programmatically up to 45 minutes on the Hobby plan and up to 5 hours on Pro and Enterprise plans.
- **Sudo:** `sudo` commands run as `vercel-sandbox` with the root home directory set to `/root`.

> **💡 Note:** The filesystem is ephemeral. You must export artifacts to durable storage if
> you need to keep them after the sandbox stops.

---

title: Sandbox CLI Reference
product: vercel
url: /docs/vercel-sandbox/cli-reference
type: reference
prerequisites:

- /docs/vercel-sandbox
  related:
- /docs/vercel-sandbox/sdk-reference
- /docs/project-configuration/general-settings
- /docs/vercel-sandbox/concepts/snapshots
  summary: Based on the Docker CLI, you can use the Sandbox CLI to manage your Vercel Sandbox from the command line.

---

# Sandbox CLI Reference

The Sandbox CLI, based on the Docker CLI, allows you to manage sandboxes, execute commands, copy files, and more from your terminal. This page provides a complete reference for all available commands.

Use the CLI for manual testing and debugging, or use the [SDK](/docs/vercel-sandbox/sdk-reference) to automate sandbox workflows in your application.

## Installation

Install the Sandbox CLI globally to use all commands:

<CodeBlock>
  <Code tab="pnpm">
    ```bash
    pnpm i sandbox
    ```
  </Code>
  <Code tab="yarn">
    ```bash
    yarn i sandbox
    ```
  </Code>
  <Code tab="npm">
    ```bash
    npm i sandbox
    ```
  </Code>
  <Code tab="bun">
    ```bash
    bun i sandbox
    ```
  </Code>
</CodeBlock>

You can invoke the CLI using the `sandbox` or `sbx` commands in your terminal.

## Authentication

Log in to use Vercel Sandbox:

```bash filename="Terminal"
sandbox login
```

## `sandbox --help`

Get help information for all available sandbox commands:

```bash filename="terminal"
sandbox <subcommand>
```

**Description:** Interfacing with Vercel Sandbox

**Available subcommands:**

- [`list`](#sandbox-list): List all sandboxes for the specified account and project. \[alias: `ls`]
- [`create`](#sandbox-create): Create a sandbox in the specified account and project.
- [`config`](#sandbox-config): Update configuration of a running sandbox (e.g. network firewall)
- [`copy`](#sandbox-copy): Copy files between your local filesystem and a remote sandbox \[alias: `cp`]
- [`exec`](#sandbox-exec): Execute a command in an existing sandbox
- [`connect`](#sandbox-connect): Start an interactive shell in an existing sandbox \[aliases: `ssh`, `shell`]
- [`stop`](#sandbox-stop): Stop one or more running sandboxes \[aliases: `rm`, `remove`]
- [`run`](#sandbox-run): Create and run a command in a sandbox
- [`snapshot`](#sandbox-snapshot): Take a snapshot of the filesystem of a sandbox
- [`snapshots`](#sandbox-snapshots): Manage sandbox snapshots
- [`login`](#sandbox-login): Log in to the Sandbox CLI
- [`logout`](#sandbox-logout): Log out of the Sandbox CLI

For more help, try running `sandbox <subcommand> --help`

## `sandbox list`

List all sandboxes for the specified account and project.

```bash filename="terminal"
sandbox list [OPTIONS]
```

### Sandbox list example

```bash filename="terminal"
# List all running sandboxes
sandbox list

# List all sandboxes (including stopped ones)
sandbox list --all

# List sandboxes for a specific project
sandbox list --project my-nextjs-app
```

### Sandbox list options

| Option                | Alias    | Description                                                                                                                                                      |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`     | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>` | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`      | `--team` | The team you want to use with this command.                                                                                                                      |

### Sandbox list flags

| Flag     | Short | Description                                                                        |
| -------- | ----- | ---------------------------------------------------------------------------------- |
| `--all`  | `-a`  | Show all sandboxes, including stopped ones (we only show running ones by default). |
| `--help` | `-h`  | Display help information.                                                          |

## `sandbox create`

Create a sandbox in the specified account and project.

```bash filename="terminal"
sandbox create [OPTIONS]
```

### Sandbox create example

```bash filename="terminal"
# Create a basic Node.js sandbox
sandbox create

# Create a Python sandbox with custom timeout
sandbox create --runtime python3.13 --timeout 1h

# Create sandbox with port forwarding
sandbox create --publish-port 8080 --project my-app

# Create sandbox silently (no output)
sandbox create --silent

# Create sandbox from a snapshot
sandbox create --snapshot snap_abc123

# Create sandbox without Internet access
sandbox create --network-policy deny-all

# Create sandbox with restricted Internet access (limited to Vercel's AI gateway)
sandbox create --allowed-domain ai-gateway.vercel.sh
```

### Sandbox create options

| Option                      | Alias    | Description                                                                                                                                                      |
| --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`           | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>`       | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`            | `--team` | The team you want to use with this command.                                                                                                                      |
| `--runtime <runtime>`       | -        | Choose between Node.js ('node24' or 'node22') or Python ('python3.13'). We'll use Node.js 24 by default.                                                         |
| `--timeout <duration>`      | -        | How long the sandbox can run before we automatically stop it. Examples: '5m', '1h'. We'll stop it after 5 minutes by default.                                    |
| `--publish-port <port>`     | `-p`     | Make a port from your sandbox accessible via a public URL.                                                                                                       |
| `--snapshot <snapshot_id>`  | -        | Create the sandbox from a previously saved snapshot.                                                                                                             |
| `--network-policy <mode>`   | -        | Base network mode to start the sandbox with ('allow-all' - default or 'deny-all'). Leave unset if using more specific rules.                                     |
| `--allowed-domain <domain>` | -        | List of domains (or pattern) to allow access to (only applicable in 'custom' mode). Use wildcard `*` to match multiple domains or subdomains.                    |
| `--allowed-cidr <cidr>`     | -        | List of address ranges to allow access to (only applicable in 'custom' mode). Traffic to those addresses will bypass domain matching.                            |
| `--denied-cidr <cidr>`      | -        | List of address ranges to deny access to (only applicable in 'custom' mode). Those take precedence over allowed domains and addresses.                           |

### Sandbox create flags

| Flag        | Short | Description                                                    |
| ----------- | ----- | -------------------------------------------------------------- |
| `--silent`  | -     | Create the sandbox without showing you the sandbox ID.         |
| `--connect` | -     | Start an interactive shell session after creating the sandbox. |
| `--help`    | `-h`  | Display help information.                                      |

## `sandbox config`

Update configuration of a running sandbox (e.g. network firewall)

```bash filename="terminal"
sandbox config <command> <SANDBOX_ID> [OPTIONS]
```

### Sandbox config example

```bash filename="terminal"
# Update the sandbox firewall to deny all egress traffic
sandbox config network-policy sb_1234567890 --network-policy deny-all

# Update the sandbox firewall to allow all egress traffic
sandbox config network-policy sb_1234567890 --mode allow-all

# Update the sandbox firewall to specific rules
sandbox config network-policy sb_1234567890 --allowed-domain vercel.com --allowed-domain ai-gateway.vercel.sh
```

### Sandbox config network-policy options

| Option                      | Alias    | Description                                                                                                                                   |
| --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `--network-policy <mode>`   | `--mode` | Base network mode to update the sandbox to ('allow-all' - default, 'deny-all'). Leave unset if using more specific rules.                     |
| `--allowed-domain <domain>` | -        | List of domains (or pattern) to allow access to (only applicable in 'custom' mode). Use wildcard `*` to match multiple domains or subdomains. |
| `--allowed-cidr <cidr>`     | -        | List of address ranges to allow access to (only applicable in 'custom' mode). Traffic to those addresses will bypass domain matching.         |
| `--denied-cidr <cidr>`      | -        | List of address ranges to deny access to (only applicable in 'custom' mode). Those take precedence over allowed domains and addresses.        |

### Sandbox config network-policy flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

### Sandbox config network-policy arguments

| Argument       | Description                    |
| -------------- | ------------------------------ |
| `<SANDBOX_ID>` | The running sandbox to update. |

## `sandbox copy`

Copy files between your local filesystem and a remote sandbox.

```bash filename="terminal"
sandbox copy [OPTIONS] <SANDBOX_ID:PATH> <SANDBOX_ID:PATH>
```

### Sandbox copy example

```bash filename="terminal"
# Copy file from local to sandbox
sandbox copy ./local-file.txt sb_1234567890:/app/remote-file.txt

# Copy file from sandbox to local
sandbox copy sb_1234567890:/app/output.log ./output.log

# Copy directory from sandbox to local
sandbox copy sb_1234567890:/app/dist/ ./build/
```

### Sandbox copy options

| Option                | Alias    | Description                                                                                                                                                      |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`     | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>` | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`      | `--team` | The team you want to use with this command.                                                                                                                      |

### Sandbox copy flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

### Sandbox copy arguments

| Argument            | Description                                                                          |
| ------------------- | ------------------------------------------------------------------------------------ |
| `<SANDBOX_ID:PATH>` | The source file path (either a local file or sandbox_id:path for remote files).      |
| `<SANDBOX_ID:PATH>` | The destination file path (either a local file or sandbox_id:path for remote files). |

## `sandbox exec`

Execute a command in an existing sandbox.

```bash filename="terminal"
sandbox exec [OPTIONS] <sandbox_id> <command> [...args]
```

### Sandbox exec example

```bash filename="terminal"
# Execute a simple command in a sandbox
sandbox exec sb_1234567890 ls -la

# Run with environment variables
sandbox exec --env DEBUG=true sb_1234567890 npm test

# Execute interactively with sudo
sandbox exec --interactive --sudo sb_1234567890 sh

# Run command in specific working directory
sandbox exec --workdir /app sb_1234567890 python script.py
```

### Sandbox exec options

| Option                  | Alias    | Description                                                                                                                                                      |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`       | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>`   | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`        | `--team` | The team you want to use with this command.                                                                                                                      |
| `--workdir <directory>` | `-w`     | Set the directory where you want the command to run.                                                                                                             |
| `--env <key=value>`     | `-e`     | Set environment variables for your command.                                                                                                                      |

### Sandbox exec flags

| Flag            | Short | Description                                        |
| --------------- | ----- | -------------------------------------------------- |
| `--sudo`        | -     | Run the command with admin privileges.             |
| `--interactive` | `-i`  | Run the command in an interactive shell.           |
| `--tty`         | `-t`  | Enable terminal features for interactive commands. |
| `--help`        | `-h`  | Display help information.                          |

### Sandbox exec arguments

| Argument       | Description                                              |
| -------------- | -------------------------------------------------------- |
| `<sandbox_id>` | The ID of the sandbox where you want to run the command. |
| `<command>`    | The command you want to run.                             |
| `[...args]`    | Additional arguments for your command.                   |

## `sandbox connect`

Start an interactive shell in an existing sandbox.

```bash filename="terminal"
sandbox connect [OPTIONS] <sandbox_id>
```

### Sandbox connect example

```bash filename="terminal"
# Connect to an existing sandbox
sandbox connect sb_1234567890

# Connect with a specific working directory
sandbox connect --workdir /app sb_1234567890

# Connect with environment variables and sudo
sandbox connect --env DEBUG=true --sudo sb_1234567890
```

### Sandbox connect options

| Option                  | Alias    | Description                                                                                                                                                      |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`       | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>`   | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`        | `--team` | The team you want to use with this command.                                                                                                                      |
| `--workdir <directory>` | `-w`     | Set the directory where you want the command to run.                                                                                                             |
| `--env <key=value>`     | `-e`     | Set environment variables for your command.                                                                                                                      |

### Sandbox connect flags

| Flag                  | Short | Description                                                                                                  |
| --------------------- | ----- | ------------------------------------------------------------------------------------------------------------ |
| `--sudo`              | -     | Run the command with admin privileges.                                                                       |
| `--no-extend-timeout` | -     | Do not extend the sandbox timeout while running an interactive command. Only affects interactive executions. |
| `--help`              | `-h`  | Display help information.                                                                                    |

### Sandbox connect arguments

| Argument       | Description                                            |
| -------------- | ------------------------------------------------------ |
| `<sandbox_id>` | The ID of the sandbox where you want to start a shell. |

## `sandbox stop`

Stop one or more running sandboxes.

```bash filename="terminal"
sandbox stop [OPTIONS] <sandbox_id> [...sandbox_id]
```

### Sandbox stop example

```bash filename="terminal"
# Stop a single sandbox
sandbox stop sb_1234567890

# Stop multiple sandboxes
sandbox stop sb_1234567890 sb_0987654321

# Stop sandbox for a specific project
sandbox stop --project my-app sb_1234567890
```

### Sandbox stop options

| Option                | Alias    | Description                                                                                                                                                      |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`     | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>` | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`      | `--team` | The team you want to use with this command.                                                                                                                      |

### Sandbox stop flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

### Sandbox stop arguments

| Argument          | Description                             |
| ----------------- | --------------------------------------- |
| `<sandbox_id>`    | The ID of the sandbox you want to stop. |
| `[...sandbox_id]` | Additional sandbox IDs to stop.         |

## `sandbox run`

Create and run a command in a sandbox.

```bash filename="terminal"
sandbox run [OPTIONS] <command> [...args]
```

### Sandbox run example

```bash filename="terminal"
# Run a simple Node.js script
sandbox run -- node --version

# Run with custom environment and timeout
sandbox run --env NODE_ENV=production --timeout 10m -- npm start

# Run interactively with port forwarding
sandbox run --interactive --publish-port 3000 --tty npm run dev

# Run with auto-cleanup
sandbox run --rm -- python3 script.py
```

### Sandbox run options

| Option                  | Alias    | Description                                                                                                                                                      |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`       | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>`   | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`        | `--team` | The team you want to use with this command.                                                                                                                      |
| `--runtime <runtime>`   | -        | Choose between Node.js ('node24' or 'node22') or Python ('python3.13'). We'll use Node.js 24 by default.                                                         |
| `--timeout <duration>`  | -        | How long the sandbox can run before we automatically stop it. Examples: '5m', '1h'. We'll stop it after 5 minutes by default.                                    |
| `--publish-port <port>` | `-p`     | Make a port from your sandbox accessible via a public URL.                                                                                                       |
| `--workdir <directory>` | `-w`     | Set the directory where you want the command to run.                                                                                                             |
| `--env <key=value>`     | `-e`     | Set environment variables for your command.                                                                                                                      |

### Sandbox run flags

| Flag            | Short | Description                                                 |
| --------------- | ----- | ----------------------------------------------------------- |
| `--sudo`        | -     | Run the command with admin privileges.                      |
| `--interactive` | `-i`  | Run the command in an interactive shell.                    |
| `--tty`         | `-t`  | Enable terminal features for interactive commands.          |
| `--rm`          | -     | Automatically delete the sandbox when the command finishes. |
| `--help`        | `-h`  | Display help information.                                   |

### Sandbox run arguments

| Argument    | Description                            |
| ----------- | -------------------------------------- |
| `<command>` | The command you want to run.           |
| `[...args]` | Additional arguments for your command. |

## `sandbox snapshot`

Take a snapshot of the filesystem of a sandbox.

```bash filename="terminal"
sandbox snapshot [OPTIONS] <SANDBOX_ID>
```

### Sandbox snapshot example

```bash filename="terminal"
# Create a snapshot of a running sandbox
sandbox snapshot sb_1234567890 --stop

# Create a snapshot that expires in 14 days
sandbox snapshot sb_1234567890 --stop --expiration 14d

# Create a snapshot that never expires
sandbox snapshot sb_1234567890 --stop --expiration 0
```

### Sandbox snapshot options

| Option                      | Alias    | Description                                                                                                                                                      |
| --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`           | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>`       | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`            | `--team` | The team you want to use with this command.                                                                                                                      |
| `--expiration <expiration>` | -        | The snapshot [expiration period](/docs/vercel-sandbox/concepts/snapshots#snapshot-limits). Examples: `1d`, `14d`. The default is 30 days.                        |

### Sandbox snapshot flags

| Flag       | Short | Description                                                 |
| ---------- | ----- | ----------------------------------------------------------- |
| `--stop`   | -     | Confirm that the sandbox will be stopped when snapshotting. |
| `--silent` | -     | Don't write snapshot ID to stdout.                          |
| `--help`   | `-h`  | Display help information.                                   |

### Sandbox snapshot arguments

| Argument       | Description                        |
| -------------- | ---------------------------------- |
| `<sandbox_id>` | The ID of the sandbox to snapshot. |

## `sandbox snapshots`

Manage sandbox snapshots.

```bash filename="terminal"
sandbox snapshots <subcommand> [OPTIONS]
```

### Sandbox snapshots subcommands

- `list`: List snapshots for the specified account and project. \[alias: `ls`]
- `get`: Get details of a snapshot.
- `delete`: Delete one or more snapshots. \[aliases: `rm`, `remove`]

## `sandbox snapshots list`

List snapshots for the specified account and project.

```bash filename="terminal"
sandbox snapshots list [OPTIONS]
```

### Sandbox snapshots list example

```bash filename="terminal"
# List snapshots for the current project
sandbox snapshots list

# List snapshots for a specific project
sandbox snapshots list --project my-app
```

### Sandbox snapshots list options

| Option                | Alias    | Description                                                                                                                                                      |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`     | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>` | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`      | `--team` | The team you want to use with this command.                                                                                                                      |

### Sandbox snapshots list flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

## `sandbox snapshots get`

Get details of a snapshot.

```bash filename="terminal"
sandbox snapshots get [OPTIONS] <snapshot_id>
```

### Sandbox snapshots get example

```bash filename="terminal"
# Get details of a specific snapshot
sandbox snapshots get snap_1234567890

# Get snapshot details for a specific project
sandbox snapshots get --project my-app snap_1234567890
```

### Sandbox snapshots get options

| Option                | Alias    | Description                                                                                                                                                      |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`     | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>` | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`      | `--team` | The team you want to use with this command.                                                                                                                      |

### Sandbox snapshots get flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

### Sandbox snapshots get arguments

| Argument        | Description                         |
| --------------- | ----------------------------------- |
| `<snapshot_id>` | The ID of the snapshot to retrieve. |

## `sandbox snapshots delete`

Delete one or more snapshots.

```bash filename="terminal"
sandbox snapshots delete [OPTIONS] <snapshot_id> [...snapshot_id]
```

### Sandbox snapshots delete example

```bash filename="terminal"
# Delete a single snapshot
sandbox snapshots delete snap_1234567890

# Delete multiple snapshots for a specific project
sandbox snapshots delete --project my-app snap_1234567890 snap_0987654321
```

### Sandbox snapshots delete options

| Option                | Alias    | Description                                                                                                                                                      |
| --------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--token <token>`     | -        | Your [Vercel authentication token](/kb/guide/how-do-i-use-a-vercel-api-access-token). If you don't provide it, we'll use a stored token or prompt you to log in. |
| `--project <project>` | -        | The [project name or ID](/docs/project-configuration/general-settings#project-id) you want to use with this command.                                             |
| `--scope <team>`      | `--team` | The team you want to use with this command.                                                                                                                      |

### Sandbox snapshots delete flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

### Sandbox snapshots delete arguments

| Argument           | Description                        |
| ------------------ | ---------------------------------- |
| `<snapshot_id>`    | Snapshot ID to delete.             |
| `[...snapshot_id]` | Additional snapshot IDs to delete. |

## `sandbox login`

Log in to the Sandbox CLI.

```bash filename="terminal"
sandbox login
```

### Sandbox login example

```bash filename="terminal"
# Log in to the Sandbox CLI
sandbox login
```

### Sandbox login flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

## `sandbox logout`

Log out of the Sandbox CLI.

```bash filename="terminal"
sandbox logout
```

### Sandbox logout example

```bash filename="terminal"
# Log out of the Sandbox CLI
sandbox logout
```

### Sandbox logout flags

| Flag     | Short | Description               |
| -------- | ----- | ------------------------- |
| `--help` | `-h`  | Display help information. |

## CLI examples

### Your first sandbox

Create a sandbox and run a command in one step:

```bash
sandbox run echo "Hello Sandbox!"
```

You'll see output like:

```
Creating sandbox... ✓
Running command...
Hello Sandbox!
Sandbox stopped.
```

### Create a long-running sandbox

For interactive work, create a sandbox that stays running:

```bash
sandbox create --timeout 30m
```

This returns a sandbox ID like `sb_abc123xyz`. Save this ID to interact with the sandbox.

### Execute commands in your sandbox

Run commands using the sandbox ID:

```bash
# Check the environment
sandbox exec sb_abc123xyz node --version

# Install packages
sandbox exec sb_abc123xyz npm init -y
sandbox exec sb_abc123xyz npm install express

# Create files
sandbox exec sb_abc123xyz touch server.js
```

### Copy files to/from sandbox

Test local code in the sandbox:

```bash
# Copy your code to the sandbox
sandbox copy ./my-app.js sb_abc123xyz:/home/sandbox/

# Run it
sandbox exec sb_abc123xyz node /home/sandbox/my-app.js

# Copy results back
sandbox copy sb_abc123xyz:/home/sandbox/output.json ./results.json
```

### Interactive shell access

Work inside the sandbox like it's your machine:

```bash
sandbox exec --interactive --tty sb_abc123xyz bash
```

Now you're inside the sandbox! Try:

```bash
pwd                    # See where you are
ls -la                 # List files
node -e "console.log('Inside!')"  # Run Node.js
exit                   # Leave when done
```

### Stop your sandbox

When finished:

```bash
sandbox stop sb_abc123xyz
```

### Test AI-generated code interactively

```bash
# Create sandbox
SANDBOX_ID=$(sandbox create --timeout 15m --silent)

# Copy AI-generated code
sandbox copy ./ai-generated.js $SANDBOX_ID:/app/

# Test it interactively
sandbox exec --interactive --tty $SANDBOX_ID bash
# Now inside: cd /app && node ai-generated.js

# Clean up
sandbox stop $SANDBOX_ID
```

### Debug a failing build

```bash
# Create sandbox with more time
sandbox create --timeout 1h

# Copy your project
sandbox copy ./my-project/ sb_abc123xyz:/app/

# Try building
sandbox exec sb_abc123xyz --workdir /app npm run build

# If it fails, debug interactively
sandbox exec -it sb_abc123xyz bash
```

### Run a development server

```bash
# Create with port exposure
sandbox create --timeout 30m --publish-port 3000

# Start your dev server
sandbox exec --workdir /app sb_abc123xyz npm run dev

# Access at the provided URL
# Visit: https://sb-abc123xyz.vercel.app
```

---

title: System Specifications
product: vercel
url: /docs/vercel-sandbox/system-specifications
type: conceptual
prerequisites:

- /docs/vercel-sandbox
  related:
  []
  summary: Detailed specifications for the Vercel Sandbox environment.

---

# System Specifications

Vercel Sandbox provides a secure, isolated environment for running your code. This page details the runtime environments, available packages, and system configuration.

## Runtimes

Sandbox includes `node24`, `node22`, and `python3.13` images. In all of these images:

- User code is executed as the `vercel-sandbox` user.
- The default working directory is `/vercel/sandbox`.
- `sudo` access is available.

|              | Runtime                   | Package managers |
| ------------ | ------------------------- | ---------------- |
| `node24`     | `/vercel/runtimes/node24` | `npm`, `pnpm`    |
| `node22`     | `/vercel/runtimes/node22` | `npm`, `pnpm`    |
| `python3.13` | `/vercel/runtimes/python` | `pip`, `uv`      |

`node24` is the default runtime if the `runtime` property is not specified.

### Available packages

The base system is Amazon Linux 2023 with the following additional packages:

- `bind-utils`
- `bzip2`
- `findutils`
- `git`
- `gzip`
- `iputils`
- `libicu`
- `libjpeg`
- `libpng`
- `ncurses-libs`
- `openssl`
- `openssl-libs`
- `procps`
- `tar`
- `unzip`
- `which`
- `whois`
- `zstd`

You can install additional packages using `dnf`. See [How to install system packages in Vercel Sandbox](/kb/guide/how-to-install-system-packages-in-vercel-sandbox) for examples.

You can find the [list of available packages](https://docs.aws.amazon.com/linux/al2023/release-notes/all-packages-AL2023.7.html) on the Amazon Linux documentation.

### Sudo config

The sandbox sudo configuration is designed to be straightforward:

- `HOME` is set to `/root`. Commands executed with sudo will source root's configuration files (e.g. `.gitconfig`, `.bashrc`, etc).
- `PATH` is left unchanged. Local or project-specific binaries will still be available when running with elevated privileges.
- The executed command inherits all other environment variables that were set.

---

title: Vercel Sandbox pricing and limits
product: vercel
url: /docs/vercel-sandbox/pricing
type: reference
prerequisites:

- /docs/vercel-sandbox
  related:
- /docs/notifications
- /docs/plans/hobby
- /docs/plans/pro-plan
- /docs/spend-management
- /docs/vercel-sandbox/concepts/snapshots
  summary: "Understand how Vercel Sandbox billing works, what's included in each plan, and the limits that apply."

---

# Vercel Sandbox pricing and limits

Vercel Sandbox usage is metered across several dimensions. This page explains how billing works for each plan, what limits apply, and how to estimate costs.

## Pricing

On each billing cycle, Hobby plans receive a monthly allotment of Sandbox usage at no cost. Pro and Enterprise plans are charged based on usage.

Once you exceed your included limit on Hobby, sandbox creation is [paused](#hobby) until the next billing cycle. Pro and Enterprise usage is charged against your account.

## Billing information

### Hobby

Sandbox is free for Hobby users within the usage limits detailed above.

Vercel sends you [notifications](/docs/notifications#on-demand-usage-notifications) as you approach your usage limits. You **will not be charged** for any additional usage. Once you exceed the limits, sandbox creation is paused until 30 days have passed since you first used the feature.

To continue using Sandbox after exceeding your limits, [upgrade to Pro](/docs/plans/hobby#upgrading-to-pro).

### Pro

All Sandbox usage on Pro plans is charged against your [$20/month credit](/docs/plans/pro-plan#credit-and-usage-allocation). After the credit is exhausted, usage is billed at the rates shown above.

To control costs, configure [Spend Management](/docs/spend-management) to receive alerts or pause projects when you reach a specified amount.

### Enterprise

Enterprise plans use the same list pricing as Pro. Contact your account team for volume discounts or higher limits.

[Contact sales](/contact/sales) for custom pricing.

## Understanding the metrics

Vercel tracks Sandbox usage across five metrics. Select a metric in the pricing table above to jump to its description.

### Active CPU

The amount of time your code actively uses the CPU, measured in hours. Time spent waiting for I/O (such as network requests, database queries, or AI model calls) does not count toward Active CPU.

### Provisioned Memory

The memory allocated to your sandbox (in GB) multiplied by the time it runs (in hours). Each vCPU includes 2 GB of memory. For example, a 4 vCPU sandbox with 8 GB of memory running for 30 minutes uses:

```
8 GB × 0.5 hours = 4 GB-hours
```

### Sandbox Creations

The number of times you call `Sandbox.create()`. Each creation counts as one, regardless of how long the sandbox runs.

### Network

The total data transferred in and out of your sandbox, measured in GB. This includes package downloads, API calls, and traffic through exposed ports.

### Snapshot Storage

The storage used by [snapshots](/docs/vercel-sandbox/concepts/snapshots), measured in GB per month.

## Example calculations

The following examples show estimated costs for common scenarios on Pro/Enterprise plans.

| Scenario           | Duration | vCPUs | Memory | Active CPU Cost | Memory Cost | Total  |
| ------------------ | -------- | ----- | ------ | --------------- | ----------- | ------ |
| Quick test         | 2 min    | 1     | 2 GB   | $0.004          | $0.001      | ~$0.01 |
| AI code validation | 5 min    | 2     | 4 GB   | $0.02           | $0.007      | ~$0.03 |
| Build and test     | 30 min   | 4     | 8 GB   | $0.26           | $0.08       | ~$0.34 |
| Long-running task  | 2 hr     | 8     | 16 GB  | $2.05           | $0.68       | ~$2.73 |

> **💡 Note:** These estimates assume 100% CPU utilization. Actual Active CPU costs are often lower because time spent waiting for I/O is not billed.

Sandbox creation costs are minimal at $0.60 per million creations ($0.0000006 per creation).

## Limits

### Resource limits

| Resource                   | Limit |
| -------------------------- | ----- |
| Maximum vCPUs per sandbox  | 8     |
| Memory per vCPU            | 2 GB  |
| Maximum memory per sandbox | 16 GB |
| Open ports per sandbox     | 4     |

### Runtime limits

The default timeout is 5 minutes. You can configure this using the `timeout` option when creating a sandbox, and extend it using `sandbox.extendTimeout()`. See [Working with Sandbox](/docs/vercel-sandbox/working-with-sandbox#execute-long-running-tasks) for details.

| Plan       | Maximum duration |
| ---------- | ---------------- |
| Hobby      | 45 minutes       |
| Pro        | 5 hours          |
| Enterprise | 5 hours          |

### Concurrency limits

| Plan       | Concurrent sandboxes |
| ---------- | -------------------- |
| Hobby      | 10                   |
| Pro        | 2,000                |
| Enterprise | 2,000                |

### Rate limits

The number of vCPUs you can allocate to new sandboxes is rate-limited by plan.

| Plan       | vCPU allocation limit   |
| ---------- | ----------------------- |
| Hobby      | 40 vCPUs per 10 minutes |
| Pro        | 200 vCPUs per minute    |
| Enterprise | 400 vCPUs per minute    |

For example, with the Pro plan limit of 200 vCPUs per minute, you can create 25 sandboxes with 8 vCPUs each, or 100 sandboxes with 2 vCPUs each, every minute.

[Contact sales](/contact/sales) if you need higher rate limits.

### Snapshot expiration

Snapshots expire after **30 days by default**. You can configure the [expiration time](/docs/vercel-sandbox/concepts/snapshots#snapshot-limits) to control how long snapshots are retained.

### Regions

Currently, Vercel Sandbox is only available in the `iad1` region.

## Managing costs

To optimize your Sandbox costs:

- **Set appropriate timeouts**: Use the shortest timeout that works for your task
- **Right-size resources**: Start with fewer vCPUs and scale up only if needed
- **Stop sandboxes promptly**: Call `sandbox.stop()` when done rather than waiting for timeout
- **Monitor usage**: Check the [Usage dashboard](https://vercel.com/d?to=%2Fdashboard%2F%5Bteam%5D%2Fusage&title=Show+Usage+Page) to track your sandbox consumption

For more details on sandbox lifecycle management, see [Working with Sandbox](/docs/vercel-sandbox/working-with-sandbox).

---

title: Run Commands in Vercel Sandbox
product: vercel
url: /docs/vercel-sandbox/run-commands-in-sandbox
type: conceptual
prerequisites:

- /docs/vercel-sandbox
  related:
- /docs/vercel-sandbox/cli-reference
- /docs/vercel-sandbox
  summary: Learn about run commands in vercel sandbox on Vercel.

---

# Running commands in a Vercel Sandbox

Use this guide to create isolated sandbox environments for running commands, builds, and tests. You'll create a sandbox, execute commands, copy files in and out, and save snapshots for reuse.

> **💡 Note:** This guide requires the [Sandbox CLI](/docs/vercel-sandbox/cli-reference).
> Install it with `npm i -g sandbox` and run `sandbox login` to
> authenticate.

## Quick reference

Use this block when you already know what you're doing and want the full command sequence. Use the steps below for context and checks.

```bash filename="terminal"
# 1. Create a sandbox
sandbox create --runtime node24 --timeout 1h --publish-port 3000

# 2. Copy project files into the sandbox
sandbox cp ./my-app/. <sandbox-id>:/app

# 3. Run commands inside the sandbox
sandbox exec --workdir /app <sandbox-id> "npm install"
sandbox exec --workdir /app <sandbox-id> "npm run build"
sandbox exec --workdir /app --env NODE_ENV=test <sandbox-id> "npm test"

# 4. Save the state as a snapshot for reuse
sandbox snapshot <sandbox-id> --stop

# 5. Create a new sandbox from the snapshot
sandbox create --snapshot <snapshot-id> --timeout 30m

# 6. Clean up
sandbox stop <sandbox-id>
```

## 1. Create a sandbox

Create a new sandbox environment with the runtime and configuration you need:

```bash filename="terminal"
sandbox create --runtime node24 --timeout 1h
```

This creates a Node.js 24 sandbox that auto-stops after one hour. The command outputs the sandbox ID.

To make a port accessible via a public URL (useful for testing web applications):

```bash filename="terminal"
sandbox create --runtime node24 --timeout 1h --publish-port 3000
```

For Python workloads:

```bash filename="terminal"
sandbox create --runtime python3.13 --timeout 1h
```

To create a sandbox and immediately connect to an interactive shell:

```bash filename="terminal"
sandbox create --runtime node24 --timeout 1h --connect
```

## 2. Copy files into the sandbox

Copy your project files into the sandbox:

```bash filename="terminal"
sandbox cp ./my-app/. <sandbox-id>:/app
```

You can also copy files out of the sandbox back to your local machine:

```bash filename="terminal"
sandbox cp <sandbox-id>:/app/output/results.json ./results.json
```

## 3. Run commands

Execute commands inside the sandbox. Use `--workdir` to set the working directory:

```bash filename="terminal"
sandbox exec --workdir /app <sandbox-id> "npm install"
```

```bash filename="terminal"
sandbox exec --workdir /app <sandbox-id> "npm run build"
```

To pass environment variables to the command:

```bash filename="terminal"
sandbox exec --workdir /app --env NODE_ENV=test <sandbox-id> "npm test"
```

For commands that need elevated permissions:

```bash filename="terminal"
sandbox exec --sudo <sandbox-id> "apt-get update && apt-get install -y jq"
```

## 4. Connect to an interactive shell

For exploratory work or debugging, connect to the sandbox interactively:

```bash filename="terminal"
sandbox connect <sandbox-id>
```

This opens a shell session inside the sandbox. Exit the shell to disconnect.

## 5. Save a snapshot

After setting up a sandbox with dependencies installed and configured, save it as a snapshot so you can recreate the same environment later:

```bash filename="terminal"
sandbox snapshot <sandbox-id> --stop
```

Snapshotting always stops the sandbox automatically. The `--stop` flag confirms you acknowledge this behavior.

To list your saved snapshots:

```bash filename="terminal"
sandbox snapshots list
```

## 6. Create a sandbox from a snapshot

Recreate an environment from a saved snapshot:

```bash filename="terminal"
sandbox create --snapshot <snapshot-id> --timeout 30m
```

This starts a new sandbox with all the files, dependencies, and configuration from the snapshot already in place.

## 7. Quick one-off commands

For simple tasks where you don't need to manage the sandbox lifecycle, use `sandbox run`. This creates a sandbox, runs a command, and optionally cleans up:

```bash filename="terminal"
sandbox run --runtime node24 --rm -- node -e 'console.log(process.version)'
```

The `--rm` flag automatically deletes the sandbox after the command finishes.

## 8. Configure network access

Control what network resources the sandbox can reach:

```bash filename="terminal"
sandbox create --runtime node24 --timeout 1h --network-policy deny-all --allowed-domain "*.npmjs.org" --allowed-domain "registry.npmjs.org"
```

To update the network policy of an existing sandbox:

```bash filename="terminal"
sandbox config network-policy <sandbox-id> --network-policy deny-all --allowed-domain "api.example.com"
```

## 9. Clean up

Stop and remove a sandbox when you're done:

```bash filename="terminal"
sandbox stop <sandbox-id>
```

To stop multiple sandboxes:

```bash filename="terminal"
sandbox stop <sandbox-id-1> <sandbox-id-2>
```

To see all running sandboxes:

```bash filename="terminal"
sandbox list
```

To include stopped sandboxes:

```bash filename="terminal"
sandbox list --all
```

## When to delete snapshots

Remove snapshots you no longer need to keep your environment clean:

```bash filename="terminal"
sandbox snapshots delete <snapshot-id>
```

## Related

- [Sandbox CLI reference](/docs/vercel-sandbox/cli-reference)
- [Vercel Sandbox overview](/docs/vercel-sandbox)
