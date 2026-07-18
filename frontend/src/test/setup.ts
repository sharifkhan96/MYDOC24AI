import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

if (!("MediaStream" in globalThis)) {
  class MockMediaStream {
    private tracks: unknown[];

    constructor(tracks: unknown[] = []) {
      this.tracks = tracks;
    }

    getTracks() {
      return this.tracks;
    }
  }

  Object.defineProperty(globalThis, "MediaStream", {
    configurable: true,
    value: MockMediaStream,
    writable: true,
  });
}
