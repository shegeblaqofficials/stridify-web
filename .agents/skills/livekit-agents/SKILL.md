---
name: livekit-agents
description: Integrate live voice chat with existing LiveKit agent servers in Next.js websites. Add floating voice assistants, widgets, or embedded voice chat. Use when building voice UI components that connect to a backend agent.
license: MIT
compatibility: Next.js 14+, requires @livekit/components-react, livekit-server-sdk packages
metadata:
  author: stridify
  version: "2.0"
  keywords: voice, chat, ui, components, streaming, client-integration
---

# LiveKit Agents Client Integration

Build voice UI components that connect to your existing LiveKit agent server. Add voice interaction to websites as floating assistants, widgets, or embedded areas.

## When to Use This Skill

Use this skill when:

- Adding voice chat to a website
- Creating floating voice assistant or widget
- Embedding voice interaction on a page
- Connecting Next.js frontend to backend agent server

## Architecture

Your backend agent server is already configured with agent logic, instructions, TTS, and project ID. Your role is building the **client-side component** that streams audio to/from this server.

```
React Component → Create Token → Connect to LiveKit → Audio Streaming
                  (API Route)      (Backend Agent)     (Real-time I/O)
```

## Step-by-Step Integration

### Step 1: Verify Environment Variables

Your `.env.local` should have:

```env
NEXT_PUBLIC_LIVEKIT_URL=ws://your-livekit-url
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
LIVEKIT_TTS_VOICE=inworld/inworld-tts-1:Lauren
PROJECT_ID=your-project-id
```

The first variable should be public (`NEXT_PUBLIC_`), others are server-only.

### Step 2: Create Token API Route

Create `app/api/livekit/token/route.ts`:

```typescript
import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomName } = await req.json();

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
    );

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      metadata: JSON.stringify({
        projectId: process.env.PROJECT_ID,
      }),
    });

    return NextResponse.json({ token: token.toJwt() });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 },
    );
  }
}
```

### Step 3: Build Voice Component

See [assets/component-template.tsx](assets/component-template.tsx) for a complete example. Basic structure:

```typescript
import { LiveKitRoom, VoiceAssistant } from "@livekit/components-react";
import { useState } from "react";

export function VoiceChat() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    setLoading(true);
    const res = await fetch("/api/livekit/token", {
      method: "POST",
      body: JSON.stringify({ roomName: `room-${Date.now()}` }),
    });
    const { token } = await res.json();
    setToken(token);
    setLoading(false);
  };

  if (!token) {
    return <button onClick={startSession}>Start Voice Chat</button>;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      onDisconnected={() => setToken("")}
    >
      <VoiceAssistant />
    </LiveKitRoom>
  );
}
```

### Step 4: Choose a Layout Pattern

Pick from three common integration patterns (see [assets/component-patterns.md](assets/component-patterns.md)):

1. **Floating Button** — Bottom-right, expand on click
2. **Embedded Section** — Voice area on page
3. **Modal/Sidebar** — Voice chat in dialog or slide-out

## Key Implementation Details

### Microphone Permissions

The browser will request microphone access when starting voice:

```typescript
const handleStart = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Permission granted, proceed with voice
  } catch {
    // Permission denied - show message
  }
};
```

### Connection States

Track and handle connection phases:

```typescript
const [status, setStatus] = useState("idle"); // idle → connecting → connected → disconnecting

return (
  <LiveKitRoom
    onConnected={() => setStatus("connected")}
    onDisconnected={() => setStatus("idle")}
  >
    {status === "connected" && <VoiceAssistant />}
  </LiveKitRoom>
);
```

### Error Handling

```typescript
const handleError = (error: any) => {
  if (error.code === "NotAllowedError") {
    // User denied microphone
  } else if (error.code === "NotFoundError") {
    // No microphone device found
  } else {
    // Network or connection error
  }
};
```

## UI Integration Patterns

### Pattern 1: Floating Assistant

```typescript
<div className="fixed bottom-6 right-6">
  <button onClick={() => setOpen(!open)}>🎤 Voice</button>
  {open && (
    <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-xl">
      <VoiceChat />
    </div>
  )}
</div>
```

### Pattern 2: Embedded in Page

```typescript
<section className="bg-blue-50 p-6 rounded-lg">
  <h2>Chat with Our Assistant</h2>
  <VoiceChat />
</section>
```

### Pattern 3: Modal

```typescript
{showVoiceModal && (
  <dialog className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6">
      <VoiceChat />
    </div>
  </dialog>
)}
```

## Testing Your Integration

Verify:

- [ ] Microphone permission request appears
- [ ] Token generation succeeds via API route
- [ ] Connection to LiveKit establishes
- [ ] Audio input is captured
- [ ] Agent responds with real-time audio output
- [ ] UI updates show connection status
- [ ] Graceful disconnect when closing

## Common Integration Issues

| Issue                     | Cause                      | Fix                                     |
| ------------------------- | -------------------------- | --------------------------------------- |
| "Token generation failed" | Missing env variables      | Verify `.env.local` has all 5 variables |
| "Connection timed out"    | Wrong LIVEKIT_URL          | Check server URL is correct             |
| "Permission denied"       | Browser blocked microphone | Check browser permissions               |
| No audio from agent       | Agent server issue         | Not a client problem                    |
| Audio glitchy/cuts out    | Network latency            | User's internet connection              |

## See Also

- [Component Patterns](assets/component-patterns.md) — UI layout examples
- [Component Template](assets/component-template.tsx) — Full working code
- [Styling](references/STYLING.md) — CSS and theming
- [Technical Details](references/REFERENCE.md) — Advanced topics
