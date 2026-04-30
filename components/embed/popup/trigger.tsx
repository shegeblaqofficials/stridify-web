import { AnimatePresence, motion } from "motion/react";
import { useVoiceAssistant } from "@livekit/components-react";
import {
  PhoneDisconnectIcon,
  WaveformIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { AppConfig, EmbedErrorDetails } from "@/lib/embed/types";
import { cn } from "@/lib/embed/utils";
import { Button } from "@/components/embed/primitives/button";

const AnimatedButton = motion.create(Button);

const DEFAULT_TRIGGER_LABEL = "Talk to us";

interface TriggerProps {
  appConfig: AppConfig;
  error: EmbedErrorDetails | null;
  popupOpen: boolean;
  onToggle: () => void;
}

export function Trigger({
  appConfig,
  error = null,
  popupOpen,
  onToggle,
}: TriggerProps) {
  const { state: agentState } = useVoiceAssistant();

  const isAgentConnecting =
    popupOpen && (agentState === "connecting" || agentState === "initializing");

  const isAgentConnected =
    popupOpen &&
    agentState !== "disconnected" &&
    agentState !== "connecting" &&
    agentState !== "initializing";

  // The expandable pill state is only used for the idle (round) trigger —
  // i.e. when the popup is closed and there's no agent activity. While
  // connecting, connected, or showing an error, the trigger stays a fixed
  // round button so its meaning (busy / hang-up) stays clear.
  const canExpand = !popupOpen && !error;
  const triggerLabel = appConfig.triggerLabel ?? DEFAULT_TRIGGER_LABEL;

  // A single background color drives the whole button so it never looks
  // like two stacked shapes. The connecting state still needs a spinning
  // ring around the icon, which we draw as an absolutely-positioned overlay
  // confined to the icon area only.
  const bgClass =
    error && popupOpen
      ? "bg-destructive"
      : isAgentConnected
        ? "bg-destructive"
        : isAgentConnecting
          ? "bg-bg1"
          : "bg-white";

  return (
    <AnimatePresence>
      <AnimatedButton
        key="trigger-button"
        size="lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{ type: "spring", duration: 1, bounce: 0.2 }}
        onClick={onToggle}
        aria-label={canExpand ? triggerLabel : undefined}
        className={cn(
          "group fixed right-4 bottom-4 z-50 m-0 flex h-12 items-center",
          "rounded-full p-0 drop-shadow-md outline-none",
          "transition-[width,padding,scale,background-color] duration-300",
          "hover:scale-105 focus-visible:scale-105",
          bgClass,
          // Default round shape; expand into a pill on hover/focus when idle.
          "w-12",
          canExpand &&
            "hover:w-auto hover:pr-5 focus-visible:w-auto focus-visible:pr-5",
        )}
      >
        {/* Icon area — fixed 48px square anchored on the left. Holds the
            current state icon plus the connecting spinner ring (when
            applicable). It has no background of its own; the parent
            button supplies the color. */}
        <span className="relative grid size-12 shrink-0 place-items-center">
          {!error && isAgentConnecting && (
            <span
              aria-hidden
              className={cn(
                "absolute inset-1 rounded-full",
                "bg-fgAccent/30 animate-spin",
                "bg-[conic-gradient(from_0deg,transparent_0%,transparent_30%,var(--color-fgAccent)_50%,transparent_70%,transparent_100%)]",
              )}
            />
          )}
          <AnimatePresence mode="wait">
            {!popupOpen && (
              <motion.div
                key="wave"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <WaveformIcon
                  size={22}
                  weight="duotone"
                  className="size-5.5 text-black"
                />
              </motion.div>
            )}
            {(isAgentConnecting || (error && popupOpen)) && (
              <motion.div
                key="dismiss"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative"
              >
                <XIcon
                  size={20}
                  weight="bold"
                  className={cn(
                    "size-5",
                    error ? "text-destructive-foreground" : "text-fg0",
                  )}
                />
              </motion.div>
            )}
            {!error && isAgentConnected && (
              <motion.div
                key="disconnect"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative"
              >
                <PhoneDisconnectIcon
                  size={20}
                  weight="bold"
                  className="text-destructive-foreground size-5"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </span>

        {/* Pill label — slides in on hover/focus while idle. Inline-block
            inside the same button (no second visual layer). */}
        {canExpand && (
          <span
            className={cn(
              "overflow-hidden whitespace-nowrap text-xs font-bold tracking-wider text-black uppercase",
              "max-w-0 opacity-0 transition-[max-width,opacity] duration-300 ease-out",
              "group-hover:max-w-50 group-hover:opacity-100",
              "group-focus-visible:max-w-50 group-focus-visible:opacity-100",
            )}
          >
            {triggerLabel}
          </span>
        )}
      </AnimatedButton>
    </AnimatePresence>
  );
}
