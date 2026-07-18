import { useEffect } from "react";

const DID_SCRIPT_ID = "did-agent-embed-script";
const DID_TARGET_ID = "did-agent-target";
const DID_SHADOW_STYLE_ID = "did-agent-shadow-overrides";
const DID_SHADOW_OVERRIDES = `
  .didagent__background {
    display: none !important;
  }

  .didagent__embedded__container,
  .didagent__embedded__video__container {
    background: #fff !important;
  }

  .didagent__embedded__video__container > video,
  .didagent__embedded__video__container img {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    background: #fff !important;
  }
`;

function installDidShadowOverrides(target: HTMLElement | null) {
  const shadowRoot = target?.shadowRoot;
  if (!shadowRoot || shadowRoot.querySelector(`#${DID_SHADOW_STYLE_ID}`)) return;

  const style = document.createElement("style");
  style.id = DID_SHADOW_STYLE_ID;
  style.textContent = DID_SHADOW_OVERRIDES;
  shadowRoot.appendChild(style);
}

function getDidEmbedConfig() {
  return {
    agentId: import.meta.env.VITE_DID_AGENT_ID?.trim(),
    clientKey: import.meta.env.VITE_DID_CLIENT_KEY?.trim(),
  };
}

export function LiveDoctorPage() {
  useEffect(() => {
    document.getElementById(DID_SCRIPT_ID)?.remove();
    const target = document.getElementById(DID_TARGET_ID);
    const { agentId, clientKey } = getDidEmbedConfig();

    if (!clientKey || !agentId) {
      return () => {
        if (target) target.replaceChildren();
      };
    }

    const script = document.createElement("script");
    script.id = DID_SCRIPT_ID;
    script.type = "module";
    script.src = "https://agent.d-id.com/v2/index.js";
    script.dataset.mode = "full";
    script.dataset.clientKey = clientKey;
    script.dataset.agentId = agentId;
    script.dataset.name = "did-agent";
    script.dataset.monitor = "true";
    script.dataset.targetId = DID_TARGET_ID;
    document.body.appendChild(script);

    installDidShadowOverrides(target);
    const shadowStyleInterval = window.setInterval(() => installDidShadowOverrides(target), 250);

    return () => {
      window.clearInterval(shadowStyleInterval);
      script.remove();
      if (target) target.replaceChildren();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI doctor</h1>
        <p className="text-navy-400">
          Speak with an AI doctor for basic symptom triage (if you are experiencing an emergency, dial 999 immediately)
        </p>
      </div>

      <div className="overflow-hidden rounded-xl2 border border-navy-100 bg-cream-100 shadow-card">
        <div
          id={DID_TARGET_ID}
          data-testid={DID_TARGET_ID}
          className="did-agent-target h-[clamp(560px,72vh,820px)]"
        />
      </div>
    </div>
  );
}
