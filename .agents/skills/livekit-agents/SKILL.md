---
name: livekit-agents
description: Build client-only voice UI in Next.js that connects to an existing LiveKit agent backend. Use when adding a voice assistant, microphone button, floating voice widget, or embedded voice session to a page. The agent server, worker, and TTS are already running — only build the React client.
license: MIT
compatibility: Next.js 14+, @livekit/components-react, livekit-client, livekit-server-sdk
metadata:
  author: stridify
  version: "3.0"
  keywords: livekit, voice, agent, client, useSession, TokenSource
---

# LiveKit Agents — Client Integration

Build **client-only** React components that stream audio to/from an already-deployed LiveKit agent. Do not build or modify the agent worker, TTS, instructions, or any backend logic — those already exist.

## When to Use

- Adding a voice button / mic UI that connects to the existing agent
- Embedding a voice session on a page (e.g. travel guide, product advisor)
- Building a floating voice widget or modal

## Environment (Already Provided)

These always exist in `.env.local`. Do not prompt the user for them and do not rename them:

```env
LIVEKIT_URL=wss://...
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_TTS_VOICE=inworld/inworld-tts-1:Lauren
```

They are **server-only** — they are read inside `app/api/livekit/token/route.ts` and returned to the client via the token endpoint. Never expose them with `NEXT_PUBLIC_`.

## Backend Endpoint (Already Provided)

`POST /api/livekit/token?template=<slug>` returns:

```json
{ "server_url": "wss://...", "participant_token": "<jwt>" }
```

Valid `template` slugs live in [lib/livekit/templates/index.ts](lib/livekit/templates/index.ts) (e.g. `city-travel-guide`, `restaurant-assistant`, `language-practice-coach`, `product-advisor`). Pick the slug that matches the page — **do not invent new slugs**. If a new template is truly needed, add it to that file first.

## Required Packages

Already installed in this workspace. Only import from:

- `@livekit/components-react` — `useSession`, `SessionProvider`, `useAgent`, `RoomAudioRenderer`, `BarVisualizer`
- `livekit-client` — `TokenSource`

## The Pattern (Follow This Exactly)

The canonical reference is `CityGuideVoiceCard` in [app/discover/city-travel-guide/page.tsx](app/discover/city-travel-guide/page.tsx). The pattern has three pieces:

### 1. A module-level `TokenSource` pointing at the token route

```tsx
import { TokenSource } from "livekit-client";

const tokenSource = TokenSource.endpoint(
  "/api/livekit/token?template=city-travel-guide",
);
```

### 2. A gating component that mounts the session only when active

LiveKit hooks (`useSession`) must only run while a session should be live. Render a static "idle" card when inactive, and swap to the active session on user interaction.

```tsx
"use client";

import { useState } from "react";

function VoiceCard() {
  const [isActive, setIsActive] = useState(false);
  if (!isActive) return <IdleCard onStart={() => setIsActive(true)} />;
  return <ActiveSession onEnd={() => setIsActive(false)} />;
}
```

### 3. The active session: `useSession` → `SessionProvider` → `useAgent`

```tsx
import { useEffect, useRef } from "react";
import {
  useSession,
  SessionProvider,
  useAgent,
  RoomAudioRenderer,
  BarVisualizer,
} from "@livekit/components-react";

function ActiveSession({ onEnd }: { onEnd: () => void }) {
  const session = useSession(tokenSource);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    session.start();
    return () => {
      session.end();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SessionProvider session={session}>
      <SessionUI onEnd={onEnd} />
      <RoomAudioRenderer />
    </SessionProvider>
  );
}

function SessionUI({ onEnd }: { onEnd: () => void }) {
  const agent = useAgent();

  const status =
    agent.state === "listening"
      ? "Listening..."
      : agent.state === "thinking"
        ? "Thinking..."
        : agent.state === "speaking"
          ? "Speaking..."
          : "Connecting...";

  return (
    <div>
      <p>{status}</p>
      {agent.microphoneTrack && (
        <BarVisualizer
          track={agent.microphoneTrack}
          state={agent.state}
          barCount={5}
        />
      )}
      <button onClick={onEnd}>End</button>
    </div>
  );
}
```

## Rules

1. **Client-only.** The file must start with `"use client"`. Do not write server code, route handlers, or agent worker code.
2. **Do not re-create the token route.** Always call the existing `/api/livekit/token?template=<slug>`.
3. **`tokenSource` is defined at module scope**, not inside a component, so it is stable across renders.
4. **Guard `session.start()`** with a `useRef` to avoid double-starting under React Strict Mode. Call `session.end()` in cleanup.
5. **`useSession` must only be mounted while active.** Use an `isActive` gate so the hook is not running on the idle screen.
6. **Always render `<RoomAudioRenderer />`** inside `<SessionProvider>` — without it the agent has no audio output.
7. **`useAgent` must be called inside `<SessionProvider>`**, not alongside `useSession`.
8. **Use `BarVisualizer` only when `agent.microphoneTrack` exists.** Render a fallback "waiting" UI otherwise.
9. **Do not set `NEXT_PUBLIC_LIVEKIT_*`.** The server URL is returned by the token endpoint; the client never reads LiveKit env vars directly.
10. **Agent state values** are `"listening" | "thinking" | "speaking" | "initializing" | "disconnected"` — branch on these for UI, don't invent new ones.

## Common Mistakes to Avoid

- ❌ Calling `useSession` at the top of a page that isn't actively in a voice session → wastes a token and opens an unused room.
- ❌ Creating the `TokenSource` inside the component body → reconnects on every render.
- ❌ Forgetting `<RoomAudioRenderer />` → user hears nothing.
- ❌ Using `NEXT_PUBLIC_LIVEKIT_URL` → not needed; the server URL comes from the token response.
- ❌ Writing a new `/api/livekit/token` route → one already exists and handles all templates.
- ❌ Passing a hand-rolled JWT or `server_url` into the client → let `TokenSource.endpoint(...)` handle fetching.

## Minimal Checklist Before Finishing

- [ ] File is `"use client"`.
- [ ] `tokenSource` defined at module scope with a valid template slug.
- [ ] Idle → Active gating via `useState`.
- [ ] `session.start()` guarded by `useRef`; cleanup calls `session.end()`.
- [ ] `<SessionProvider>` wraps UI and contains `<RoomAudioRenderer />`.
- [ ] `useAgent()` used inside the provider; UI branches on `agent.state`.
- [ ] No backend, worker, or env var changes.
