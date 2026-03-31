"use client";

import { useState, useEffect, useRef } from "react";

type SimulatorState = "idle" | "calling" | "connected" | "ended";

const KEYPAD: { digit: string; letters: string }[] = [
  { digit: "1", letters: "" },
  { digit: "2", letters: "ABC" },
  { digit: "3", letters: "DEF" },
  { digit: "4", letters: "GHI" },
  { digit: "5", letters: "JKL" },
  { digit: "6", letters: "MNO" },
  { digit: "7", letters: "PQRS" },
  { digit: "8", letters: "TUV" },
  { digit: "9", letters: "WXYZ" },
  { digit: "\u2217", letters: "" },
  { digit: "0", letters: "+" },
  { digit: "#", letters: "" },
];

function formatDisplay(num: string) {
  const d = num.replace(/\D/g, "");
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

interface PhoneSimulatorProps {
  agentName?: string;
  onStartCall?: (phoneNumber: string) => void;
  onEndCall?: () => void;
}

export function PhoneSimulator({
  agentName = "Stridify AI",
  onStartCall,
  onEndCall,
}: PhoneSimulatorProps) {
  const [state, setState] = useState<SimulatorState>("idle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state === "connected") {
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (state === "idle") setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleDial = (digit: string) => {
    if (phoneNumber.length < 15) setPhoneNumber((p) => p + digit);
  };

  const handleDelete = () => setPhoneNumber((p) => p.slice(0, -1));

  const handleStartCall = () => {
    if (!phoneNumber) return;
    setState("calling");
    onStartCall?.(phoneNumber);
    setTimeout(() => setState("connected"), 2500);
  };

  const handleEndCall = () => {
    setState("ended");
    onEndCall?.();
    setTimeout(() => {
      setState("idle");
      setMuted(false);
      setSpeaker(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full bg-surface-elevated/30">
      {/* ── Section header ── */}
      <div className="px-8 pt-8 pb-3 shrink-0">
        <h2 className="text-lg font-bold text-foreground mb-1">
          Live Simulator
        </h2>
        <p className="text-[13px] text-muted-foreground">
          Test your agent&apos;s response in real-time before deploying.
        </p>
      </div>

      {/* ── iPhone mockup ── */}
      <div className="flex-1 flex items-start justify-center relative min-h-0 px-6 pt-2 pb-4">
        <div className="relative w-75 bg-black rounded-[3rem] p-2.5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)] border-8 border-neutral-800 scale-[0.85] xl:scale-95 transition-transform origin-center">
          {/* Hardware buttons */}
          <div className="absolute -left-2.5 top-28 w-0.75 h-10 bg-neutral-700 rounded-l-sm" />
          <div className="absolute -left-2.5 top-44 w-0.75 h-10 bg-neutral-700 rounded-l-sm" />
          <div className="absolute -right-2.5 top-36 w-0.75 h-16 bg-neutral-700 rounded-r-sm" />

          {/* Screen */}
          <div
            className="w-full bg-black rounded-[2.4rem] overflow-hidden flex flex-col relative"
            style={{ aspectRatio: "9 / 19.5" }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-end pr-4 border border-neutral-900">
              <div className="size-2.5 rounded-full bg-neutral-800 ring-1 ring-neutral-700" />
            </div>

            {/* iOS status bar */}
            <div className="flex items-center justify-between px-8 pt-3 pb-0 text-white/60 text-[10px] font-semibold z-10">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-2.5"
                  viewBox="0 0 16 12"
                  fill="currentColor"
                >
                  <rect
                    x="0"
                    y="7"
                    width="3"
                    height="5"
                    rx="0.5"
                    opacity="0.4"
                  />
                  <rect
                    x="4.5"
                    y="4.5"
                    width="3"
                    height="7.5"
                    rx="0.5"
                    opacity="0.6"
                  />
                  <rect
                    x="9"
                    y="2"
                    width="3"
                    height="10"
                    rx="0.5"
                    opacity="0.8"
                  />
                  <rect x="13" y="0" width="3" height="12" rx="0.5" />
                </svg>
                <svg
                  className="w-4 h-2.5"
                  viewBox="0 0 25 12"
                  fill="currentColor"
                >
                  <rect
                    x="0"
                    y="1"
                    width="21"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.4"
                  />
                  <rect x="1.5" y="2.5" width="14" height="7" rx="1" />
                  <rect
                    x="22"
                    y="4"
                    width="2"
                    height="4"
                    rx="0.5"
                    opacity="0.4"
                  />
                </svg>
              </div>
            </div>

            {/* Screen content */}
            <div className="flex-1 flex flex-col min-h-0">
              {state === "idle" ? (
                /* ── iOS Dial Pad ── */
                <div className="flex flex-col flex-1 pt-10 px-4 pb-6">
                  {/* Number display */}
                  <div className="h-14 flex items-center justify-center mb-1">
                    <span
                      className={`font-light text-white tracking-wide transition-all ${
                        phoneNumber.length > 7
                          ? "text-xl"
                          : phoneNumber.length > 0
                            ? "text-2xl"
                            : "text-lg text-white/30"
                      }`}
                    >
                      {phoneNumber
                        ? formatDisplay(phoneNumber)
                        : "Enter a Number"}
                    </span>
                  </div>

                  {/* Keypad grid */}
                  <div className="grid grid-cols-3 gap-x-5 gap-y-3 px-2">
                    {KEYPAD.map(({ digit, letters }) => (
                      <button
                        key={digit}
                        onClick={() =>
                          handleDial(digit === "\u2217" ? "*" : digit)
                        }
                        className="flex flex-col items-center justify-center size-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-100 mx-auto"
                      >
                        <span className="text-2xl font-light text-white leading-none">
                          {digit}
                        </span>
                        {letters && (
                          <span className="text-[8px] font-bold text-white/50 tracking-widest mt-0.5">
                            {letters}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Bottom row: empty | call | delete */}
                  <div className="grid grid-cols-3 gap-x-5 px-2 mt-3">
                    <div />
                    <button
                      onClick={handleStartCall}
                      className={`size-16 rounded-full flex items-center justify-center mx-auto transition-all duration-150 ${
                        phoneNumber
                          ? "bg-emerald-500 hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/30"
                          : "bg-emerald-500/40 cursor-not-allowed"
                      }`}
                    >
                      <svg
                        className="size-7 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                    </button>
                    <div className="flex items-center justify-center">
                      {phoneNumber && (
                        <button
                          onClick={handleDelete}
                          className="size-16 rounded-full flex items-center justify-center hover:bg-white/5 active:bg-white/10 transition-colors mx-auto"
                        >
                          <svg
                            className="size-6 text-white/60"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : state === "calling" ? (
                /* ── Calling screen (iOS style) ── */
                <div className="flex flex-col items-center flex-1 pt-12">
                  <h3 className="text-2xl font-light text-white mb-2 tracking-wide">
                    {formatDisplay(phoneNumber)}
                  </h3>
                  <p className="text-sm text-white/50 font-medium mb-auto">
                    calling mobile...
                  </p>

                  {/* Contact avatar pulse */}
                  <div className="size-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center mb-auto animate-pulse">
                    <span className="text-3xl font-semibold text-white/70">
                      {agentName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* End call button */}
                  <div className="mb-14">
                    <button
                      onClick={handleEndCall}
                      className="size-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-400 active:scale-95 transition-all"
                    >
                      <svg
                        className="size-7 text-white rotate-135"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                    </button>
                    <p className="text-[10px] text-white/30 font-semibold text-center mt-2 uppercase tracking-wider">
                      End
                    </p>
                  </div>
                </div>
              ) : state === "connected" ? (
                /* ── Connected screen (iOS call UI) ── */
                <div className="flex flex-col items-center flex-1 pt-10">
                  <div className="mt-auto">
                    <h3 className="text-2xl font-light text-white mb-1 tracking-wide truncate max-w-full px-4 text-center">
                      {agentName.length > 20
                        ? agentName.slice(0, 20) + "…"
                        : agentName}
                    </h3>
                    <p className="text-sm text-white/50 font-medium text-center">
                      {formatTime(elapsed)}
                    </p>
                  </div>

                  {/* 3x2 iOS call controls */}
                  <div className="grid grid-cols-3 gap-x-6 gap-y-5 mt-22 px-4 w-full">
                    {/* Mute */}
                    <button
                      onClick={() => setMuted((m) => !m)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`size-14 rounded-full flex items-center justify-center transition-colors ${
                          muted
                            ? "bg-white text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {muted ? (
                          <svg
                            className="size-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                            />
                            <line
                              x1="3"
                              y1="3"
                              x2="21"
                              y2="21"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="size-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">
                        {muted ? "unmute" : "mute"}
                      </span>
                    </button>

                    {/* Keypad */}
                    <button className="flex flex-col items-center gap-1.5">
                      <div className="size-14 rounded-full bg-white/10 text-white flex items-center justify-center">
                        <svg
                          className="size-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <circle cx="6" cy="6" r="1.25" fill="currentColor" />
                          <circle cx="12" cy="6" r="1.25" fill="currentColor" />
                          <circle cx="18" cy="6" r="1.25" fill="currentColor" />
                          <circle cx="6" cy="12" r="1.25" fill="currentColor" />
                          <circle
                            cx="12"
                            cy="12"
                            r="1.25"
                            fill="currentColor"
                          />
                          <circle
                            cx="18"
                            cy="12"
                            r="1.25"
                            fill="currentColor"
                          />
                          <circle cx="6" cy="18" r="1.25" fill="currentColor" />
                          <circle
                            cx="12"
                            cy="18"
                            r="1.25"
                            fill="currentColor"
                          />
                          <circle
                            cx="18"
                            cy="18"
                            r="1.25"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">
                        keypad
                      </span>
                    </button>

                    {/* Speaker */}
                    <button
                      onClick={() => setSpeaker((s) => !s)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={`size-14 rounded-full flex items-center justify-center transition-colors ${
                          speaker
                            ? "bg-white text-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        <svg
                          className="size-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">
                        {speaker ? "speaker" : "speaker"}
                      </span>
                    </button>

                    {/* Add call */}
                    <button className="flex flex-col items-center gap-1.5 opacity-40">
                      <div className="size-14 rounded-full bg-white/10 text-white flex items-center justify-center">
                        <svg
                          className="size-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">
                        add call
                      </span>
                    </button>

                    {/* FaceTime */}
                    <button className="flex flex-col items-center gap-1.5 opacity-40">
                      <div className="size-14 rounded-full bg-white/10 text-white flex items-center justify-center">
                        <svg
                          className="size-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">
                        FaceTime
                      </span>
                    </button>

                    {/* Contacts */}
                    <button className="flex flex-col items-center gap-1.5 opacity-40">
                      <div className="size-14 rounded-full bg-white/10 text-white flex items-center justify-center">
                        <svg
                          className="size-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                          />
                        </svg>
                      </div>
                      <span className="text-[10px] text-white/50 font-medium">
                        contacts
                      </span>
                    </button>
                  </div>

                  {/* End call */}
                  <div className="mt-6 mb-12">
                    <button
                      onClick={handleEndCall}
                      className="size-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-400 active:scale-95 transition-all"
                    >
                      <svg
                        className="size-7 text-white rotate-135"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Ended ── */
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="size-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                    <span className="text-3xl font-semibold text-white/40">
                      {agentName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-light text-white mb-1 tracking-wide truncate max-w-full px-4 text-center">
                    {agentName.length > 20
                      ? agentName.slice(0, 20) + "…"
                      : agentName}
                  </h3>
                  <p className="text-sm text-white/40 font-medium">
                    Call Ended &middot; {formatTime(elapsed)}
                  </p>
                </div>
              )}
            </div>

            {/* iOS home indicator */}
            <div className="flex justify-center pb-2">
              <div className="w-28 h-1 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
