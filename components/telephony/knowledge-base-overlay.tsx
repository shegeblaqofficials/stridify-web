"use client";

import { useState, useRef, useCallback } from "react";
import {
  HiOutlineXMark,
  HiOutlineArrowLeft,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlinePencilSquare,
  HiOutlineCloudArrowUp,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineLink,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineChevronDown,
} from "react-icons/hi2";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
type SourceType = "text" | "document" | "api";
type KnowledgeStatus = "synced" | "processing" | "error";
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH";

interface KnowledgeSource {
  id: string;
  name: string;
  type: SourceType;
  status: KnowledgeStatus;
  size?: string;
  lastSync?: string;
}

interface KnowledgeBaseOverlayProps {
  open: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */
const INITIAL_SOURCES: KnowledgeSource[] = [];

/* ------------------------------------------------------------------ */
/*  Helper: source type badge                                         */
/* ------------------------------------------------------------------ */
function typeLabel(type: SourceType) {
  switch (type) {
    case "text":
      return "Manual Entry";
    case "document":
      return "Document";
    case "api":
      return "API Endpoint";
  }
}

function typeIcon(type: SourceType) {
  switch (type) {
    case "text":
      return HiOutlinePencilSquare;
    case "document":
      return HiOutlineDocumentText;
    case "api":
      return HiOutlineLink;
  }
}

function statusBadge(status: KnowledgeStatus) {
  switch (status) {
    case "synced":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Synced
        </span>
      );
    case "processing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-surface-elevated text-muted-foreground">
          <HiOutlineArrowPath className="size-3 animate-spin" />
          Processing
        </span>
      );
    case "error":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-500/10 text-red-600 dark:text-red-400">
          Error
        </span>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export function KnowledgeBaseOverlay({
  open,
  onClose,
}: KnowledgeBaseOverlayProps) {
  const [sources, setSources] = useState<KnowledgeSource[]>(INITIAL_SOURCES);
  const [view, setView] = useState<"list" | "add">("list");
  const [selectedSourceType, setSelectedSourceType] =
    useState<SourceType>("text");

  // Add-form state
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiMethod, setApiMethod] = useState<HttpMethod>("GET");
  const [apiBody, setApiBody] = useState("");
  const [apiName, setApiName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setTextTitle("");
    setTextContent("");
    setApiUrl("");
    setApiMethod("GET");
    setApiBody("");
    setApiName("");
    setUploadedFiles([]);
    setSelectedSourceType("text");
  }, []);

  const handleAddSource = useCallback(() => {
    let newSource: KnowledgeSource;
    const id = crypto.randomUUID();

    if (selectedSourceType === "text") {
      if (!textTitle.trim() || !textContent.trim()) return;
      newSource = {
        id,
        name: textTitle.trim(),
        type: "text",
        status: "synced",
        size: `${new Blob([textContent]).size} B`,
        lastSync: "Just now",
      };
    } else if (selectedSourceType === "document") {
      if (uploadedFiles.length === 0) return;
      const file = uploadedFiles[0];
      newSource = {
        id,
        name: file.name,
        type: "document",
        status: "processing",
        size: formatFileSize(file.size),
        lastSync: "Just now",
      };
    } else {
      if (!apiUrl.trim()) return;
      newSource = {
        id,
        name: apiName.trim() || apiUrl.trim(),
        type: "api",
        status: "processing",
        lastSync: "Just now",
      };
    }

    setSources((prev) => [newSource, ...prev]);
    resetForm();
    setView("list");
  }, [
    selectedSourceType,
    textTitle,
    textContent,
    uploadedFiles,
    apiUrl,
    apiName,
    resetForm,
  ]);

  const handleRemoveSource = useCallback((id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      /\.(pdf|txt|docx|csv)$/i.test(f.name),
    );
    if (files.length > 0) setUploadedFiles(files);
  }, []);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-in fade-in duration-200">
      {/* ── Header ── */}
      <header className="flex h-14 items-center justify-between px-6 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {view === "add" ? (
            <button
              onClick={() => {
                resetForm();
                setView("list");
              }}
              className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground"
            >
              <HiOutlineArrowLeft className="size-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground"
            >
              <HiOutlineArrowLeft className="size-4" />
            </button>
          )}
          <div>
            <h1 className="text-sm font-bold text-foreground">
              {view === "add" ? "Add Knowledge Source" : "Knowledge Base"}
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {view === "add"
                ? "Teach your agent about your business"
                : `${sources.length} source${sources.length !== 1 ? "s" : ""} configured`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === "list" && (
            <button
              onClick={() => setView("add")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <HiOutlinePlusCircle className="size-3.5" />
              Add Source
            </button>
          )}
          {view === "add" && (
            <button
              onClick={handleAddSource}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <HiOutlineCheckCircle className="size-3.5" />
              Save Source
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors text-muted-foreground hover:text-foreground"
          >
            <HiOutlineXMark className="size-4" />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto workspace-scrollbar">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {view === "list" ? (
            <ListView
              sources={sources}
              onAdd={() => setView("add")}
              onRemove={handleRemoveSource}
            />
          ) : (
            <AddView
              sourceType={selectedSourceType}
              onSourceTypeChange={setSelectedSourceType}
              textTitle={textTitle}
              onTextTitleChange={setTextTitle}
              textContent={textContent}
              onTextContentChange={setTextContent}
              apiUrl={apiUrl}
              onApiUrlChange={setApiUrl}
              apiMethod={apiMethod}
              onApiMethodChange={setApiMethod}
              apiBody={apiBody}
              onApiBodyChange={setApiBody}
              apiName={apiName}
              onApiNameChange={setApiName}
              uploadedFiles={uploadedFiles}
              onUploadedFilesChange={setUploadedFiles}
              isDragging={isDragging}
              onDraggingChange={setIsDragging}
              onDrop={handleDrop}
              fileInputRef={fileInputRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LIST VIEW                                                         */
/* ================================================================== */
function ListView({
  sources,
  onAdd,
  onRemove,
}: {
  sources: KnowledgeSource[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="size-16 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6 border border-border">
          <HiOutlineDocumentText className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">
          No knowledge sources yet
        </h2>
        <p className="text-[13px] text-muted-foreground max-w-sm mb-8">
          Add text, documents, or API connections so your agent can answer
          questions about your business, products, and services.
        </p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <HiOutlinePlusCircle className="size-4" />
          Add Your First Source
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sources table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-elevated/50 text-[10px] uppercase tracking-widest text-muted-foreground font-bold border-b border-border">
              <th className="px-5 py-3.5">Source</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 hidden sm:table-cell">Size</th>
              <th className="px-5 py-3.5 hidden sm:table-cell">Last Sync</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sources.map((source) => {
              const Icon = typeIcon(source.type);
              return (
                <tr
                  key={source.id}
                  className="group hover:bg-surface-elevated/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-surface-elevated border border-border/60">
                        <Icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-foreground truncate">
                          {source.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {typeLabel(source.type)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{statusBadge(source.status)}</td>
                  <td className="px-5 py-4 text-[12px] text-muted-foreground hidden sm:table-cell">
                    {source.size ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-[12px] text-muted-foreground hidden sm:table-cell">
                    {source.lastSync ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors">
                        <HiOutlinePencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onRemove(source.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <HiOutlineTrash className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="bg-surface-elevated/30 px-5 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">
            {sources.length} source{sources.length !== 1 ? "s" : ""} active
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ADD VIEW                                                          */
/* ================================================================== */
interface AddViewProps {
  sourceType: SourceType;
  onSourceTypeChange: (t: SourceType) => void;
  textTitle: string;
  onTextTitleChange: (v: string) => void;
  textContent: string;
  onTextContentChange: (v: string) => void;
  apiUrl: string;
  onApiUrlChange: (v: string) => void;
  apiMethod: HttpMethod;
  onApiMethodChange: (v: HttpMethod) => void;
  apiBody: string;
  onApiBodyChange: (v: string) => void;
  apiName: string;
  onApiNameChange: (v: string) => void;
  uploadedFiles: File[];
  onUploadedFilesChange: (f: File[]) => void;
  isDragging: boolean;
  onDraggingChange: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const SOURCE_TYPES: {
  key: SourceType;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "text",
    label: "Manual Text",
    desc: "Paste or write custom text for your agent.",
    Icon: HiOutlinePencilSquare,
  },
  {
    key: "document",
    label: "Document",
    desc: "Upload PDF, TXT, or CSV files.",
    Icon: HiOutlineDocumentText,
  },
  {
    key: "api",
    label: "URL / API",
    desc: "Connect to a live data endpoint.",
    Icon: HiOutlineGlobeAlt,
  },
];

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH"];

function AddView({
  sourceType,
  onSourceTypeChange,
  textTitle,
  onTextTitleChange,
  textContent,
  onTextContentChange,
  apiUrl,
  onApiUrlChange,
  apiMethod,
  onApiMethodChange,
  apiBody,
  onApiBodyChange,
  apiName,
  onApiNameChange,
  uploadedFiles,
  onUploadedFilesChange,
  isDragging,
  onDraggingChange,
  onDrop,
  fileInputRef,
}: AddViewProps) {
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);

  return (
    <div className="space-y-10">
      {/* ── Source type selector ── */}
      <section>
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
          Choose Source Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SOURCE_TYPES.map(({ key, label, desc, Icon }) => (
            <button
              key={key}
              onClick={() => onSourceTypeChange(key)}
              className={[
                "group p-5 rounded-2xl border text-left transition-all duration-150",
                sourceType === key
                  ? "bg-primary border-primary text-primary-foreground shadow-lg"
                  : "bg-surface border-border hover:border-muted-foreground/30 hover:shadow-sm",
              ].join(" ")}
            >
              <div
                className={[
                  "inline-flex p-2.5 rounded-xl mb-3 transition-colors",
                  sourceType === key
                    ? "bg-primary-foreground/15"
                    : "bg-surface-elevated border border-border/60 group-hover:bg-primary/5",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "size-5",
                    sourceType === key
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-primary",
                  ].join(" ")}
                />
              </div>
              <p
                className={[
                  "text-[13px] font-bold mb-0.5",
                  sourceType === key
                    ? "text-primary-foreground"
                    : "text-foreground",
                ].join(" ")}
              >
                {label}
              </p>
              <p
                className={[
                  "text-[11px]",
                  sourceType === key
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Source configuration ── */}
      <section>
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
          Source Configuration
        </label>

        <div className="rounded-2xl border border-border bg-surface p-6">
          {/* Text entry */}
          {sourceType === "text" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Title
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => onTextTitleChange(e.target.value)}
                  placeholder="e.g. Company FAQ, Product Details"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Content
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => onTextContentChange(e.target.value)}
                  placeholder="Paste raw text, instructions, or product information here..."
                  rows={8}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-none workspace-scrollbar"
                />
              </div>
            </div>
          )}

          {/* Document upload */}
          {sourceType === "document" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  onDraggingChange(true);
                }}
                onDragLeave={() => onDraggingChange(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  "relative flex flex-col items-center justify-center py-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-muted-foreground/40 hover:bg-surface-elevated/50",
                ].join(" ")}
              >
                <div className="size-14 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4 border border-border/60">
                  <HiOutlineCloudArrowUp className="size-6 text-muted-foreground" />
                </div>
                <p className="text-[13px] font-semibold text-foreground mb-1">
                  Drag & drop files here
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PDF, TXT, DOCX, CSV up to 50MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.docx,.csv"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > 0) onUploadedFilesChange(files);
                  }}
                  className="hidden"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
                    >
                      <HiOutlineDocumentText className="size-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          onUploadedFilesChange(
                            uploadedFiles.filter((_, idx) => idx !== i),
                          )
                        }
                        className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <HiOutlineXMark className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                <div className="h-px flex-1 bg-border" />
                or
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 text-[12px] font-bold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Browse Local Files
                </button>
              </div>
            </div>
          )}

          {/* API / URL */}
          {sourceType === "api" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Source Name
                </label>
                <input
                  type="text"
                  value={apiName}
                  onChange={(e) => onApiNameChange(e.target.value)}
                  placeholder="e.g. Product API, Pricing Endpoint"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Endpoint URL
                </label>
                <div className="flex gap-2">
                  {/* Method dropdown */}
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setMethodDropdownOpen((o) => !o)}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-3 text-[12px] font-bold text-foreground hover:bg-surface-elevated transition-colors min-w-22.5 justify-between"
                    >
                      {apiMethod}
                      <HiOutlineChevronDown
                        className={`size-3.5 text-muted-foreground transition-transform ${methodDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {methodDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-full rounded-xl border border-border bg-surface shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        {HTTP_METHODS.map((m) => (
                          <button
                            key={m}
                            onClick={() => {
                              onApiMethodChange(m);
                              setMethodDropdownOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-[12px] font-bold text-left transition-colors hover:bg-surface-elevated ${
                              m === apiMethod
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => onApiUrlChange(e.target.value)}
                    placeholder="https://api.example.com/v1/data"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>

              {(apiMethod === "POST" ||
                apiMethod === "PUT" ||
                apiMethod === "PATCH") && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-muted-foreground">
                    Request Body (JSON)
                  </label>
                  <textarea
                    value={apiBody}
                    onChange={(e) => onApiBodyChange(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={6}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-[13px] font-mono font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors resize-none workspace-scrollbar"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Utility                                                           */
/* ------------------------------------------------------------------ */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
