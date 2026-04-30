import * as React from "react";
import ReactDOM from "react-dom/client";
import { getAppConfig, setStridifyApiOrigin } from "@/lib/embed/env";
import { getShadowStyles } from "@/lib/embed/styles";
import globalCss from "@/app/embed.css";
import PopupAgentClient from "./agent-client";

const scriptTag = document.querySelector<HTMLScriptElement>(
  "script[data-stridify-sandbox-id]",
);
const sandboxIdAttribute = scriptTag?.dataset.stridifySandboxId;
const triggerLabelAttribute = scriptTag?.dataset.stridifyTriggerLabel;

// Derive the Stridify backend origin from where this script was loaded so
// API calls (config + connection details) hit the Stridify server, not the
// embedding site.
if (scriptTag?.src) {
  try {
    setStridifyApiOrigin(new URL(scriptTag.src).origin);
  } catch {
    // ignore — falls back to window.location.origin
  }
}

if (sandboxIdAttribute) {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", "stridify-embed-wrapper");
  document.body.appendChild(wrapper);

  const shadowRoot = wrapper.attachShadow({ mode: "open" });

  const styleTag = document.createElement("style");
  styleTag.textContent = globalCss as unknown as string;
  shadowRoot.appendChild(styleTag);

  const reactRoot = document.createElement("div");
  shadowRoot.appendChild(reactRoot);

  getAppConfig(window.location.origin, sandboxIdAttribute)
    .then((appConfig) => {
      // Allow the embedding site to override the trigger label via
      // `data-stridify-trigger-label` on the <script> tag.
      if (triggerLabelAttribute) {
        appConfig.triggerLabel = triggerLabelAttribute;
      }

      const dynamicStyles = getShadowStyles(appConfig);
      if (dynamicStyles) {
        const dynamicStyleTag = document.createElement("style");
        dynamicStyleTag.textContent = dynamicStyles;
        shadowRoot.appendChild(dynamicStyleTag);
      }

      const root = ReactDOM.createRoot(reactRoot);
      root.render(
        <React.StrictMode>
          <PopupAgentClient appConfig={appConfig} />
        </React.StrictMode>,
      );
    })
    .catch((err) => {
      console.error(
        "Stridify popup embed error - Error loading app config:",
        err,
      );
    });
} else {
  console.error(
    "Stridify popup embed error - no data-stridify-sandbox-id attribute found on script tag. This is required!",
  );
}
