"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import { motion } from "motion/react";
import {
  RoomAudioRenderer,
  RoomContext,
  StartAudio,
} from "@livekit/components-react";
import { ErrorMessage } from "@/components/embed/popup/error-message";
import { PopupView } from "@/components/embed/popup/popup-view";
import { Trigger } from "@/components/embed/popup/trigger";
import useConnectionDetails from "@/hooks/embed/use-connection-details";
import type { AppConfig, EmbedErrorDetails } from "@/lib/embed/types";

const PopupViewMotion = motion.create(PopupView);

export type EmbedPopupAgentClientProps = {
  appConfig: AppConfig;
};

function PopupAgentClient({ appConfig }: EmbedPopupAgentClientProps) {
  const isAnimating = useRef(false);
  const room = useMemo(() => new Room(), []);
  const [popupOpen, setPopupOpen] = useState(false);
  const [error, setError] = useState<EmbedErrorDetails | null>(null);
  const {
    connectionDetails,
    refreshConnectionDetails,
    existingOrRefreshConnectionDetails,
  } = useConnectionDetails(appConfig);

  const handleTogglePopup = () => {
    if (isAnimating.current) return;
    setError(null);
    setPopupOpen((open) => !open);
  };

  const handlePanelAnimationStart = () => {
    isAnimating.current = true;
  };

  const handlePanelAnimationComplete = () => {
    isAnimating.current = false;
    if (!popupOpen && room.state !== "disconnected") {
      room.disconnect();
    }
  };

  useEffect(() => {
    const onDisconnected = () => {
      setPopupOpen(false);
      refreshConnectionDetails();
    };
    const onMediaDevicesError = (e: Error) => {
      setError({
        title: "Encountered an error with your media devices",
        description: `${e.name}: ${e.message}`,
      });
    };
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room, refreshConnectionDetails]);

  useEffect(() => {
    if (!popupOpen) return;
    if (!connectionDetails) {
      setError({
        title: "Error fetching connection details",
        description: "Please try again later",
      });
      return;
    }
    if (room.state !== "disconnected") return;

    const connect = async () => {
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: appConfig.isPreConnectBufferEnabled,
        }),
        existingOrRefreshConnectionDetails().then((details) =>
          room.connect(details.serverUrl, details.participantToken),
        ),
      ]).catch((err) => {
        if (err instanceof Error) {
          console.error("Error connecting to agent:", err);
          setError({
            title: "There was an error connecting to the agent",
            description: `${err.name}: ${err.message}`,
          });
        }
      });
    };

    connect();
  }, [
    room,
    popupOpen,
    connectionDetails,
    existingOrRefreshConnectionDetails,
    appConfig.isPreConnectBufferEnabled,
  ]);

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      <StartAudio label="Start Audio" />

      <Trigger
        appConfig={appConfig}
        error={error}
        popupOpen={popupOpen}
        onToggle={handleTogglePopup}
      />

      <motion.div
        inert={!popupOpen}
        initial={{ opacity: 0, translateY: 8 }}
        animate={{
          opacity: popupOpen ? 1 : 0,
          translateY: popupOpen ? 0 : 8,
        }}
        transition={{
          type: "spring",
          bounce: 0,
          duration: popupOpen ? 1 : 0.2,
        }}
        onAnimationStart={handlePanelAnimationStart}
        onAnimationComplete={handlePanelAnimationComplete}
        className="fixed right-4 bottom-20 left-4 z-50 md:left-auto"
      >
        <div className="bg-bg1 dark:bg-bg2 border-separator1 dark:border-separator2 ml-auto h-120 w-full rounded-[28px] border border-solid drop-shadow-md md:w-90">
          <div className="relative h-full w-full">
            <ErrorMessage appConfig={appConfig} error={error} />
            {!error && (
              <PopupViewMotion
                appConfig={appConfig}
                initial={{ opacity: 1 }}
                animate={{ opacity: error === null ? 1 : 0 }}
                transition={{ type: "linear" as any, duration: 0.2 }}
                disabled={!popupOpen}
                sessionStarted={popupOpen}
                onEmbedError={setError}
                className="absolute inset-0"
              />
            )}
          </div>
        </div>
      </motion.div>
    </RoomContext.Provider>
  );
}

export default PopupAgentClient;
