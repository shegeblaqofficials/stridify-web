import { useCallback, useEffect, useState } from "react";
import { decodeJwt } from "jose";
import type { AppConfig } from "@/lib/embed/types";
import { getStridifyApiOrigin } from "@/lib/embed/env";

const ONE_MINUTE_MS = 60 * 1000;

export interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

export default function useConnectionDetails(appConfig: AppConfig) {
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);

  const fetchConnectionDetails = useCallback(async () => {
    setConnectionDetails(null);
    const apiOrigin = getStridifyApiOrigin();
    const url = new URL(
      "/api/livekit/connection-details",
      apiOrigin || window.location.origin,
    );

    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sandbox-Id": appConfig.sandboxId ?? "",
      },
      body: JSON.stringify({
        room_config: appConfig.agentName
          ? { agents: [{ agent_name: appConfig.agentName }] }
          : undefined,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch connection details (${res.status})`);
    }

    const data = (await res.json()) as ConnectionDetails;
    setConnectionDetails(data);
    return data;
  }, [appConfig.sandboxId, appConfig.agentName]);

  useEffect(() => {
    fetchConnectionDetails().catch((err) =>
      console.error("[stridify-embed] connection details error:", err),
    );
  }, [fetchConnectionDetails]);

  const isExpired = useCallback(() => {
    const token = connectionDetails?.participantToken;
    if (!token) return true;
    const payload = decodeJwt(token);
    if (!payload.exp) return true;
    const expiresAt = new Date((payload.exp - 60) * 1000 - ONE_MINUTE_MS);
    return new Date() >= expiresAt;
  }, [connectionDetails?.participantToken]);

  const existingOrRefreshConnectionDetails = useCallback(async () => {
    if (!connectionDetails || isExpired()) return fetchConnectionDetails();
    return connectionDetails;
  }, [connectionDetails, fetchConnectionDetails, isExpired]);

  return {
    connectionDetails,
    refreshConnectionDetails: fetchConnectionDetails,
    existingOrRefreshConnectionDetails,
  };
}
