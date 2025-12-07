// tests/setup.js
import { JSDOM } from "jsdom";

// Mock error-manager module
vi.mock("../src/js/error-manager.js", () => {
  const SOURCES = {
    CHOICE_MANAGER: "Choice Manager",
    CONTENT_PROCESSOR: "Content Processor",
    DISPLAY_MANAGER: "Display Manager",
    DOM_HELPERS: "DOM Helpers",
    KEYBOARD_HELP: "Keyboard Help",
    KEYBOARD_SHORTCUTS: "Keyboard Shortcuts",
    MODAL: "Modal",
    MARKDOWN: "Markdown Processor",
    NAVIGATION_MANAGER: "Navigation Manager",
    PAGE_MANAGER: "Page Manager",
    SAVES_MODAL: "Saves Modal",
    SAVE_SYSTEM: "Save System",
    SETTINGS_MANAGER: "Settings Manager",
    STORY_MANAGER: "Story Manager",
    SYSTEM: "System",
    TAG_PROCESSOR: "Tag Processor",
  };

  // Create shared mock functions
  const errorFn = vi.fn();
  const warningFn = vi.fn();
  const criticalFn = vi.fn();

  return {
    ErrorManager: { SOURCES },
    ERROR_SOURCES: SOURCES,
    errorManager: {
      error: errorFn,
      warning: warningFn,
      critical: criticalFn,
      forSource: vi.fn(() => ({
        error: errorFn,
        warning: warningFn,
        critical: criticalFn,
      })),
      safely: vi.fn((fn, fallback) => {
        try {
          return fn();
        } catch {
          return fallback;
        }
      }),
      safelyAsync: vi.fn(async (fn, fallback) => {
        try {
          return await fn();
        } catch {
          return fallback;
        }
      }),
    },
  };
});

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

window.InkTemplate = {
  storyManager: null,
  errorManager: { error: vi.fn(), warning: vi.fn(), critical: vi.fn() },
  notificationManager: { show: vi.fn() },
  keyboardShortcuts: null,
  keyboardHelpModal: null,
};

export const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = String(value);
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

let consoleLogs = [];
const originalLog = console.log;
const originalError = console.error;

beforeEach(() => {
  consoleLogs = [];
  vi.spyOn(console, "log").mockImplementation((...args) => {
    consoleLogs.push({ type: "log", args });
  });
  vi.spyOn(console, "error").mockImplementation((...args) => {
    consoleLogs.push({ type: "error", args });
  });
});

afterEach((context) => {
  // If test failed, replay captured console output
  if (context.task.result?.state === "fail") {
    consoleLogs.forEach(({ type, args }) => {
      if (type === "log") originalLog(...args);
      if (type === "error") originalError(...args);
    });
  }
  vi.restoreAllMocks();
});
