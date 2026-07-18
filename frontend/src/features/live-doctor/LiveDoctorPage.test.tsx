import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import App from "@/App";
import { Sidebar } from "@/components/layout/Sidebar";
import { LiveDoctorPage } from "./LiveDoctorPage";

function didScript() {
  return document.querySelector<HTMLScriptElement>('script[data-name="did-agent"]');
}

function stubDidEnv() {
  vi.stubEnv("VITE_DID_CLIENT_KEY", "test-did-client-key");
  vi.stubEnv("VITE_DID_AGENT_ID", "test-did-agent-id");
}

afterEach(() => {
  didScript()?.remove();
  vi.unstubAllEnvs();
});

describe("LiveDoctorPage", () => {
  it("opens from the public route without redirecting to login", async () => {
    window.history.pushState({}, "", "/live-doctor");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /AI doctor/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("does not show the generic medical disclaimer under the D-ID embed", () => {
    render(<LiveDoctorPage />);

    expect(
      screen.getByText(
        /Speak with an AI doctor for basic symptom triage \(if you are experiencing an emergency, dial 999 immediately\)/i,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Informational guidance, not a diagnosis/i)).not.toBeInTheDocument();
  });

  it("labels the app sidebar link as AI doctor", () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /AI doctor/i })).toHaveAttribute("href", "/app/live-doctor");
    expect(screen.queryByRole("link", { name: /Live doctor/i })).not.toBeInTheDocument();
  });

  it("injects the D-ID hosted embed script with the provided agent config", () => {
    stubDidEnv();

    render(<LiveDoctorPage />);

    const script = didScript();
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute("type", "module");
    expect(script).toHaveAttribute("src", "https://agent.d-id.com/v2/index.js");
    expect(script).toHaveAttribute("data-mode", "full");
    expect(script).toHaveAttribute("data-client-key", "test-did-client-key");
    expect(script).toHaveAttribute("data-agent-id", "test-did-agent-id");
    expect(script).toHaveAttribute("data-monitor", "true");
    expect(script).toHaveAttribute("data-target-id", "did-agent-target");
    const target = screen.getByTestId("did-agent-target");
    expect(target).toHaveAttribute("id", "did-agent-target");
    expect(target).toHaveClass("did-agent-target");
    expect(target).toHaveClass("h-[clamp(560px,72vh,820px)]");
  });

  it("does not inject the D-ID hosted embed script without env config", () => {
    render(<LiveDoctorPage />);

    expect(didScript()).not.toBeInTheDocument();
  });

  it("installs shadow-root styles that remove D-ID's blurred background fill", async () => {
    stubDidEnv();

    render(<LiveDoctorPage />);

    const target = screen.getByTestId("did-agent-target");
    const shadowRoot = target.attachShadow({ mode: "open" });

    await waitFor(() => {
      const style = shadowRoot.querySelector<HTMLStyleElement>("#did-agent-shadow-overrides");

      expect(style).toBeInTheDocument();
      expect(style?.textContent).toContain(".didagent__background");
      expect(style?.textContent).toContain("display: none");
      expect(style?.textContent).toContain("object-fit: contain");
    });
  });

  it("removes the hosted embed script on unmount so remounts do not duplicate it", () => {
    stubDidEnv();

    const { unmount } = render(<LiveDoctorPage />);

    expect(didScript()).toBeInTheDocument();

    unmount();

    expect(didScript()).not.toBeInTheDocument();
  });
});
