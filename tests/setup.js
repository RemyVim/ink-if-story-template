// tests/setup.js
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
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
