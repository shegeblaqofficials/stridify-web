# Stridify Widget Template - AI Coding Context

## Quick Summary

**Stridify** is an AI voice agent platform. A **Widget** is an embeddable AI voice assistant that adds conversational AI to any website via a simple embed script.

## What You're Building

A **widget template repository** that shows developers how to:

1. Create an embeddable widget (iframe-based)
2. Add a simple landing page
3. Provide clear installation instructions
4. Show working examples (popup, floating chat, etc)

## The Core Concept

```
Developer's website + Stridify embed script = AI voice widget on their site
```

### How Users Use It

```html
<script>
  window.StridifyWidget = { projectId: "abc123" };
</script>
<script src="https://stridify.com/widget.js" async></script>
```

That's it! A floating widget appears on their website with zero framework requirements.

## What to Build

### 1. **embed.js** - The Script Tag They Copy-Paste

- Loads on third-party websites
- Injects widget UI into their page
- Creates iframe for isolation
- Manages WebRTC audio connection
- Handles authentication

### 2. **Widget UI** (in iframe)

- Floating button or chat interface
- Microphone input + audio visualization
- Real-time text display
- Theme customization
- Built with React (runs in iframe context)

### 3. **Landing Page**

```
Hero: "Add AI Assistant to Your Website in Seconds"
   ↓
"How It Works" with 3 steps
   ↓
Code example (copy-paste friendly)
   ↓
Interactive demo showing:
  - Floating widget variant
  - Popup variant
  - Chat bubble variant
   ↓
FAQ & customization options
   ↓
CTA: "Get Your Widget"
```

### 4. **Examples**

- `simple-popup.html` - Basic HTML integration
- `floating-chat.html` - Chat bubble style
- `react-example.tsx` - React integration
- `nextjs-example.tsx` - Next.js integration

### 5. **Documentation**

- `INSTALLATION.md` - Steps to embed widget
- `API.md` - Configuration options
- `CUSTOMIZATION.md` - How to style it

## Key Features to Highlight

| Feature                | Why            | Example                               |
| ---------------------- | -------------- | ------------------------------------- |
| **One-line install**   | Zero config    | Copy-paste script tag                 |
| **Framework agnostic** | Works anywhere | Works on static HTML, React, Vue, etc |
| **Secure iframe**      | Isolation      | Parent page doesn't access widget     |
| **Real-time audio**    | Modern UX      | Natural conversation                  |
| **Customizable**       | Brand match    | Change colors, position, text         |
| **Mobile friendly**    | Responsive     | Works on all devices                  |

## Widget Configuration (What Embed Script Accepts)

```javascript
window.StridifyWidget = {
  projectId: "required-string", // ID from Stridify dashboard
  config: {
    position: "bottom-right", // bottom-right, bottom-left, etc
    primaryColor: "#0d7377", // Brand color
    displayMode: "floating-button", // floating-button, popup, chat
    greetingMessage: "Hi! Ask me...", // Initial greeting
    autoOpen: false, // Auto open on page load
    width: 400, // Widget width (px)
    height: 600, // Widget height (px)
  },
};
```

## Implementation Architecture

```
┌──────────────────────────┐
│   Third-party website    │
│  + embed script tag      │
└──────────────────────────┘
            ↓
┌──────────────────────────┐
│  Widget (iframe)         │
│  - Button / Chat UI      │
│  - Audio capture         │
│  - Message display       │
└──────────────────────────┘
            ↓
┌──────────────────────────┐
│ Stridify Backend         │
│  - LiveKit signaling     │
│  - Agent logic           │
│  - LLM / TTS / STT       │
└──────────────────────────┘
```

## Development Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Iframe Communication**: postMessage API
- **Audio**: WebRTC + LiveKit SDK
- **Backend Integration**: REST API + WebSocket
- **Build**: Next.js or Vite (for embed script)
- **Deployment**: Vercel or similar

## Landing Page Sections

1. **Hero** (with working demo)
   - Headline + subheading
   - "Get Started" button
   - Screenshot or video of widget in action

2. **Features** (4-6 key points)
   - One-line installation
   - No framework required
   - Customizable appearance
   - Real-time voice conversations
   - Mobile responsive
   - Secure & isolated

3. **How It Works** (visual steps)
   - Step 1: Create agent (link to Stridify dashboard)
   - Step 2: Copy embed code
   - Step 3: Paste into website
   - Step 4: Done!

4. **Code Examples**
   - HTML example (minimal)
   - React example (with hooks)
   - Configuration options table

5. **Live Examples/Demos**
   - Interactive widget showing popup variant
   - Toggle to show floating button
   - Theme customization demo

6. **FAQ**
   - Browser support?
   - Microphone not available?
   - Can we disable voice/use text?
   - Customization options?
   - GDPR/Privacy?
   - Pricing?

7. **Getting Started CTA**
   - Button to Stridify dashboard
   - Link to documentation
   - Support contact

## Example Code Snippets for Landing Page

### Minimal HTML Example

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Website</title>
  </head>
  <body>
    <h1>Welcome to my site</h1>

    <!-- Add Stridify widget in 2 lines -->
    <script>
      window.StridifyWidget = { projectId: "your-project-id" };
    </script>
    <script src="https://stridify.com/embed/widget.js" async></script>
  </body>
</html>
```

### React Example

```jsx
import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    window.StridifyWidget = {
      projectId: "your-project-id",
      config: { position: "bottom-right" },
    };

    const script = document.createElement("script");
    script.src = "https://stridify.com/embed/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div>Your app content here</div>;
}
```

## File Structure

```
stridify-widget-template/
├── README.md                          # Quick start
├── package.json
├── public/
│   └── embed.js                       # The embedder script
├── src/
│   ├── iframe-app/                    # React app for iframe
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── FloatingButton.tsx
│   │   │   ├── ChatWidget.tsx
│   │   │   └── PopupWidget.tsx
│   │   └── styles/
│   ├── pages/                         # Landing page
│   │   ├── index.tsx
│   │   ├── examples.tsx
│   │   └── docs.tsx
│   ├── lib/
│   │   ├── livekit-client.ts          # WebRTC setup
│   │   └── config.ts
│   └── styles/
├── examples/
│   ├── html/
│   │   ├── basic.html
│   │   └── with-customization.html
│   ├── react/
│   │   └── App.tsx
│   └── nextjs/
│       └── integration.tsx
├── docs/
│   ├── INSTALLATION.md
│   ├── API.md
│   ├── CUSTOMIZATION.md
│   └── FAQ.md
└── scripts/
    └── build-embed.js                 # Build the embed script
```

## Key Messaging

**"Add a Voice AI Assistant to Your Website in Seconds"**

Why developers choose Stridify widgets:

- ✅ No backend required
- ✅ Works on any website (no framework dependency)
- ✅ Professional UI out of the box
- ✅ Fully customizable (colors, position, behavior)
- ✅ Real-time voice conversations
- ✅ Analytics included
- ✅ Scales with your traffic

## Success Metrics

Good widget template should allow:

- ✅ Copy-paste of embed script to get widget working
- ✅ 5-minute integration time
- ✅ Visual understanding of customization options
- ✅ Working examples in multiple frameworks
- ✅ Clear documentation for developers
- ✅ Easy brand customization

---

**Use this context when writing code for the widget template. Every component should consider:**

- Iframe isolation and sandboxing
- postMessage communication with parent
- LiveKit WebRTC integration
- Configuration flexibility
- Clear user/developer experience
- Mobile responsiveness
