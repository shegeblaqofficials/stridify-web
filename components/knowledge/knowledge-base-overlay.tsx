"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAccount } from "@/provider/account-provider";
import {
  HiOutlineXMark,
  HiOutlinePlusCircle,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineArrowPath,
  HiOutlineTrash,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

interface KnowledgeBaseOverlayProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  organizationId: string;
}

interface KnowledgeFile {
  id: string;
  filename: string;
  file_type: "pdf" | "csv" | "txt";
  chunks_count: number;
  created_at: string;
  file_size?: number;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function KnowledgeBaseOverlay({
  open,
  onClose,
  projectId,
  organizationId,
}: KnowledgeBaseOverlayProps) {
  const { account } = useAccount();
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Load knowledge files
  useEffect(() => {
    if (open && projectId && organizationId) {
      loadFiles();
    }
  }, [open, projectId, organizationId]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/knowledge/upload?organization_id=${organizationId}&project_id=${projectId}`,
      );
      const data = await res.json();
      if (data.success) {
        setFiles(data.knowledge || []);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, organizationId]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFile = droppedFiles.find((f) =>
      /\.(pdf|txt|csv)$/i.test(f.name),
    );

    if (validFile) {
      setSelectedFile(validFile);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        setSelectedFile(files[0]);
      }
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setUploadMessage("Processing document...");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("organization_id", organizationId);
      formData.append("project_id", projectId);
      if (description.trim()) {
        formData.append("description", description);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(95);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadProgress(100);
      setUploadStatus("success");
      setUploadMessage(
        `✓ Uploaded "${selectedFile.name}"\n${data.knowledge.chunks_count} chunks processed`,
      );
      setSelectedFile(null);
      setDescription("");

      // Reload files
      setTimeout(() => {
        loadFiles();
        setUploadStatus("idle");
        setUploadProgress(0);
      }, 1500);
    } catch (error) {
      setUploadStatus("error");
      setUploadMessage(
        error instanceof Error ? error.message : "Upload failed",
      );
    }
  }, [selectedFile, organizationId, projectId, description, loadFiles]);

  const handleDelete = useCallback(
    async (knowledgeId: string, filename: string) => {
      if (!confirm(`Delete "${filename}"? This cannot be undone.`)) return;

      setDeleting(knowledgeId);
      try {
        const res = await fetch(
          `/api/knowledge/search?knowledge_id=${knowledgeId}&organization_id=${organizationId}`,
          { method: "DELETE" },
        );

        if (!res.ok) {
          throw new Error("Failed to delete");
        }

        setFiles((prev) => prev.filter((f) => f.id !== knowledgeId));
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : "Failed to delete knowledge file",
        );
      } finally {
        setDeleting(null);
      }
    },
    [organizationId],
  );

  if (!open || !account) return null;

  const totalChunks = files.reduce((sum, f) => sum + f.chunks_count, 0);
  const totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Knowledge Base
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {files.length === 0
                ? "Upload documents for AI-powered search"
                : `${files.length} file${files.length !== 1 ? "s" : ""} • ${totalChunks} chunks`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          >
            <HiOutlineXMark className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedFile ? (
            // Upload form
            <div className="space-y-6">
              {/* File preview */}
              <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-100">
                  <HiOutlineDocumentText className="size-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setDescription("");
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HiOutlineXMark className="size-5" />
                </button>
              </div>

              {/* Description input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., Product documentation, FAQ, company policies..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Upload progress */}
              {uploadStatus !== "idle" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {uploadStatus === "uploading"
                        ? "Processing..."
                        : uploadStatus === "success"
                          ? "Uploaded!"
                          : "Error"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        uploadStatus === "success"
                          ? "bg-green-500"
                          : uploadStatus === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {uploadMessage && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {uploadMessage}
                    </p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setDescription("");
                    setUploadStatus("idle");
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadStatus === "uploading"}
                  className="flex-1 px-4 py-2.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {uploadStatus === "uploading" ? (
                    <>
                      <HiOutlineArrowPath className="size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <HiOutlineCheckCircle className="size-4" />
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // File list or upload prompt
            <div className="space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <HiOutlineArrowPath className="size-8 text-gray-400 animate-spin mb-3" />
                  <p className="text-gray-500">Loading documents...</p>
                </div>
              ) : files.length === 0 ? (
                <div className="space-y-6">
                  {/* Empty state with drag-drop */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="inline-flex items-center justify-center size-12 rounded-full bg-gray-100 mb-4">
                      <HiOutlineDocumentText className="size-6 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {isDragging
                        ? "Drop your files here"
                        : "Drag files or click to upload"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Supports PDF, TXT, and CSV (max 50MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Info box */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                    <div className="flex gap-3">
                      <HiOutlineExclamationTriangle className="size-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          How it works
                        </p>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                          <li>• Documents are split into searchable chunks</li>
                          <li>• Each chunk gets converted to an embedding</li>
                          <li>
                            • Your AI agent can search this knowledge base
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // File list
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group"
                    >
                      <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <HiOutlineDocumentText className="size-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {file.filename}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {file.chunks_count} chunks •{" "}
                          {new Date(file.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(file.id, file.filename)}
                        disabled={deleting === file.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === file.id ? (
                          <HiOutlineArrowPath className="size-5 animate-spin" />
                        ) : (
                          <HiOutlineTrash className="size-5" />
                        )}
                      </button>
                    </div>
                  ))}

                  {/* Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">
                        {files.length}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Documents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">
                        {totalChunks}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Chunks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold text-gray-900">
                        {(totalSize / 1024 / 1024).toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">MB</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 flex justify-between items-center">
          {!selectedFile && files.length > 0 && (
            <p className="text-xs text-gray-500">
              Knowledge is ready for AI search and retrieval
            </p>
          )}
          {!selectedFile && files.length === 0 && (
            <p className="text-xs text-gray-500">No documents uploaded yet</p>
          )}
          <button
            onClick={() => {
              if (selectedFile) {
                setSelectedFile(null);
              } else {
                fileInputRef.current?.click();
              }
            }}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <HiOutlinePlusCircle className="size-4" />
            {selectedFile ? "Choose different file" : "Upload document"}
          </button>
        </div>
      </div>
    </div>
  );
}
