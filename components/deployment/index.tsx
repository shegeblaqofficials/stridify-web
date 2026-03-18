"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  HiOutlineDocumentText,
  HiOutlineClipboard,
  HiOutlineGlobeAlt,
  HiOutlineDevicePhoneMobile,
  HiOutlineCommandLine,
  HiOutlineArrowPath,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineCheck,
  HiOutlineQrCode,
} from "react-icons/hi2";

const deployments = [
  {
    version: "v2.4.1",
    status: "Successful",
    date: "Dec 24, 2024 14:30",
    environment: "Production",
  },
  {
    version: "v2.4.0",
    status: "Successful",
    date: "Dec 23, 2024 09:15",
    environment: "Staging",
  },
  {
    version: "v2.3.9",
    status: "Processing",
    date: "Dec 22, 2024 18:45",
    environment: "Production",
  },
  {
    version: "v2.3.8",
    status: "Successful",
    date: "Dec 21, 2024 11:20",
    environment: "Staging",
  },
];

const publicUrl = "https://smart-home-assistant.stridify.app";
const apiKey = "sk-stridify-xxxxxxxxxxxxxxxxxxxx";
const curlExample = `curl -X POST \\
  https://api.stridify.app/v1/agent \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello"}'`;

export function Deployment() {
  const [copied, setCopied] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Deploy Project
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Smart Home Assistant
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <HiOutlineDocumentText className="h-4 w-4" />
              Documentation
            </Button>
            <Button variant="primary" size="sm">
              New Release
            </Button>
          </div>
        </div>

        {/* Deployment cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {/* Web Application */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2.5 text-foreground">
              <HiOutlineGlobeAlt className="h-5 w-5" />
              <h2 className="text-sm font-semibold">Web Application</h2>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Public URL</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-border bg-surface-elevated/50 px-3 py-2">
                <span className="truncate text-xs text-foreground">
                  {publicUrl}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(publicUrl, "url")}
                className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                {copied === "url" ? (
                  <HiOutlineCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <HiOutlineClipboard className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <Button variant="primary" size="sm" className="w-1/2 py-3">
                Deploy to Web
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Last updated 2 hours ago
            </p>
          </div>

          {/* Mobile PWA */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2.5 text-foreground">
              <HiOutlineDevicePhoneMobile className="h-5 w-5" />
              <h2 className="text-sm font-semibold">Mobile PWA</h2>
            </div>
            <div className="mt-4 flex flex-col items-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-border bg-surface-elevated/50">
                <HiOutlineQrCode className="h-20 w-20 text-muted-foreground/40" />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Scan to test on mobile
              </p>
            </div>
          </div>

          {/* API Endpoint */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2.5 text-foreground">
              <HiOutlineCommandLine className="h-5 w-5" />
              <h2 className="text-sm font-semibold">API Endpoint</h2>
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-border bg-surface-elevated/50 p-3">
              <pre className="overflow-x-auto text-[11px] leading-relaxed text-muted-foreground">
                <code>{curlExample}</code>
              </pre>
            </div>
            <div className="mt-3">
              <p className="text-xs text-muted-foreground">API Key</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-border bg-surface-elevated/50 px-3 py-2">
                  <span className="truncate font-mono text-xs text-foreground">
                    {showKey ? apiKey : "sk-stridify-••••••••••••"}
                  </span>
                </div>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                >
                  {showKey ? (
                    <HiOutlineEyeSlash className="h-4 w-4" />
                  ) : (
                    <HiOutlineEye className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => copyToClipboard(apiKey, "key")}
                  className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
                >
                  {copied === "key" ? (
                    <HiOutlineCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <HiOutlineClipboard className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button className="mt-2 flex items-center gap-1.5 text-[11px] text-primary transition-colors hover:text-primary/80">
                <HiOutlineArrowPath className="h-3 w-3" />
                Rotate Key
              </button>
            </div>
          </div>
        </div>

        {/* Deployment History */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground">
            Deployment History
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/50">
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                    Version
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                    Environment
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-surface-elevated/30"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs font-medium text-foreground">
                      {d.version}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          d.status === "Successful"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                        ].join(" ")}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {d.date}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {d.environment}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
                          Logs
                        </button>
                        <button className="text-xs font-medium text-primary transition-colors hover:text-primary/80">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
