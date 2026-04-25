# Stridify: AI Voice Agent Platform - Widget Template Context

## What is Stridify?

Stridify is a **no-code/low-code platform for building, deploying, and embedding AI voice agents** that can interact with users in real-time. It leverages modern AI technologies (LLMs, text-to-speech, speech-to-text) to create intelligent conversational assistants for websites, phone systems, and embedded widgets.

### Key Capabilities

- **AI Agent Generation**: Users describe what they want ("build a customer support agent that handles returns"), and Stridify generates a fully functional voice agent
- **Multiple Deployment Types**:
  - **Web**: Embedded agents within websites
  - **Telephony**: IVR systems for phone interactions
  - **Widget**: Lightweight embeddable assistants for third-party websites
- **Real-time Communication**: Powered by LiveKit for low-latency audio streaming
- **AI Integration**: Supports OpenAI, Anthropic, Google LLMs for natural language understanding
- **Pre-built Templates**: Examples like Language Practice Coach, Restaurant Assistant, Product Advisor, Customer Support, etc.

## What is a Stridify Widget?

A **Widget** in Stridify is a lightweight, embeddable AI voice assistant that can be integrated into any website without requiring a full page redesign. It's the most accessible way for third-party developers to add conversational AI to their applications.

### Widget Characteristics

- **Iframe-Based**: Embeds as a secure iframe within existing websites
- **Embed Script**: Developers add a simple `<script>` tag to enable the widget
- **Floating UI**: Typically appears as a floating button, chat bubble, or widget panel
- **Pop-up Option**: Can also appear as a modal pop-up overlay
- **Minimal Dependencies**: Works with existing HTML/CSS/JS without framework requirements
- **Easy Installation**: No complex setup—just copy-paste a script tag
- **Real-time Voice**: Full-duplex audio communication with the AI agent
- **Customizable**: Appearance, behavior, and settings can be configured via embed parameters

### Widget Use Cases

- Customer support chat on e-commerce sites
- Appointment booking on service provider sites
- Product inquiries and recommendations
- Lead generation and qualification
- Accessibility features (voice-enabled navigation)
- Knowledge base assistance
- Sales demos and product walkthroughs

## Widget Implementation Architecture

```
┌─────────────────────────────────────────────────────────┐
│                Third-Party Website                       │
│  (Host page - customer's site where widget is embedded) │
└─────────────────────────────────────────────────────────┘
                          ↓
         ┌────────────────────────────────────┐
         │    Embed Script Tag                 │
         │  <script src="...widget.js"></script>│
         └────────────────────────────────────┘
                          ↓
    ┌─────────────────────────────────────────────┐
    │         Widget Iframe Container             │
    │  (Stridify - Isolated, sandboxed context)  │
    │  ┌──────────────────────────────────────┐  │
    │  │  - Floating Button / Chat UI         │  │
    │  │  - WebRTC Audio Connection           │  │
    │  │  - LiveKit Session Management        │  │
    │  │  - Agent State & Conversation        │  │
    │  └──────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
                          ↓
              ┌──────────────────────────┐
              │  Stridify Backend        │
              │  - Agent Logic           │
              │  - LLM Integration       │
              │  - LiveKit Signaling     │
              │  - Session Management    │
              └──────────────────────────┘
                          ↓
              ┌──────────────────────────┐
              │  External Services       │
              │  - OpenAI / Anthropic    │
              │  - Text-to-Speech        │
              │  - Speech-to-Text        │
              │  - LiveKit Media Server  │
              └──────────────────────────┘
```

## Widget Embed Implementation

### Basic Embed Script Pattern

```javascript
// Host website includes:
<script>
  window.StridifyWidget = {
    projectId: "abc123",
    config: {
      position: "bottom-right",
      primaryColor: "#0d7377",
      greetingMessage: "Hi! How can I help?"
    }
  };
</script>
<script src="https://stridify.com/embed/widget.js" async></script>
```

### What the Embed Script Does

1. Detects when it's loaded on a third-party site
2. Creates a container element for the widget (floating button or chat bubble)
3. Injects an iframe that loads the widget UI
4. Establishes secure communication between parent page and iframe
5. Handles authentication and session tokens
6. Manages WebRTC/audio connections to the Stridify backend

### Widget Configuration Options

- **Position**: `bottom-right`, `bottom-left`, `top-right`, `top-left`, `center`
- **Display Mode**: `floating-button`, `chat-bubble`, `popup`, `full-page`
- **Styling**: Primary color, font, size, custom branding
- **Behavior**: Auto-open delay, greeting message, close on blur
- **Permissions**: Microphone access, recording options, data collection

## Template Structure for Widget Repository

The widget template repository should include:

```
stridify-widget-template/
├── README.md                 # Quick start guide
├── CONTEXT.md               # This file (for AI coding)
├── public/
│   └── embed.js             # The embeddable script that gets added to host sites
├── src/
│   ├── iframe/              # Content served inside the iframe
│   │   ├── app.tsx          # Main React app for iframe
│   │   ├── hooks/           # Custom hooks for widget logic
│   │   ├── components/      # UI components (button, chat, etc)
│   │   └── styles/          # Styling
│   ├── parent-bridge/       # postMessage communication with parent page
│   ├── livekit/             # LiveKit integration
│   └── config/              # Configuration types & defaults
├── examples/
│   ├── simple-popup.html    # HTML example of popup widget
│   ├── floating-chat.html   # HTML example of floating chat
│   ├── react-integration.tsx# React component integration
│   └── nextjs-integration.tsx# Next.js integration
├── docs/
│   ├── INSTALLATION.md      # How to add widget to a site
│   ├── API.md               # Configuration API reference
│   ├── CUSTOMIZATION.md     # How to style/brand the widget
│   └── EXAMPLES.md          # Code examples
└── package.json
```

## Landing Page Content

The landing page should clearly explain:

### Hero Section

- **Headline**: "Add AI Voice Assistant to Your Website in Minutes"
- **Subheading**: "Embed a Stridify voice widget with just one line of code"
- **CTA**: "Get Started" + "View Examples"

### Key Features Section

- **Easy Integration**: Copy-paste embed script
- **No Framework Required**: Works on any website
- **Customizable**: Match your brand
- **Real-time Audio**: Full-duplex voice conversations
- **Secure**: Iframe isolation and encrypted connections

### How It Works Section

1. Create/select an agent in Stridify dashboard
2. Copy the embed code
3. Paste it into your website
4. Done! Widget is live

### Code Example Section

```html
<!-- Step 1: Add this to your HTML -->
<script>
  window.StridifyWidget = {
    projectId: "your-project-id",
    config: { position: "bottom-right" },
  };
</script>
<script src="https://stridify.com/embed/widget.js" async></script>

<!-- That's it! Widget appears on page load -->
```

### Customization Examples

Show interactive demos:

- Floating button widget
- Chat bubble widget
- Modal/popup widget
- Different positions (corner variants)
- Theme customization (colors, fonts)

### Use Cases Section

- E-commerce: Customer support
- SaaS: Product demos and onboarding
- Service providers: Appointment booking
- Real estate: Property inquiries
- Healthcare: Patient intake
- Education: Course assistance

### FAQ Section

- "What if users don't have microphones?"
- "Can I customize the appearance?"
- "What browsers are supported?"
- "How much does it cost?"
- "Is it GDPR compliant?"
- "Can users chat instead of voice?"

## Key Technologies

- **LiveKit**: Real-time communication (WebRTC)
- **Next.js**: Backend and example pages
- **React**: Widget UI components
- **AI SDKs**: LLM integrations (OpenAI, Anthropic, Google)
- **Vercel**: Deployment platform

## Widget Flow (User Perspective)

1. User visits third-party website
2. Floating widget button appears (Stridify branding or custom)
3. User clicks button → iframe loads with UI
4. Widget requests microphone permission
5. User speaks into microphone
6. Audio is processed by AI agent backend
7. Agent responds with speech (audio)
8. Conversation continues in real-time
9. User can close widget or ask more questions

## Security & Isolation

- Widget runs in **sandboxed iframe** (same-origin restrictions)
- **postMessage API** for secure parent-to-iframe communication
- **Token-based authentication** with Stridify backend
- **CORS headers** properly configured
- **No cookies** passed between parent and iframe
- **Encrypted WebRTC** connections

## Monetization Model (Context for Business Logic)

- **Free tier**: Basic widget with Stridify branding
- **Pro tier**: Custom branding, analytics
- **Enterprise**: Custom integrations, SLA, dedicated support
- **Pay-as-you-go**: Cost per minute of widget usage

---

**This context helps AI coders understand:**

- What Stridify is and does
- What a widget is in this ecosystem
- How to build the embed script
- How to structure the iframe content
- What examples and documentation to create
- The user journey and technical requirements
