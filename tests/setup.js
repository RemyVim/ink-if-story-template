import { readFileSync } from "fs";
import { join } from "path";

function loadScript(relativePath) {
  const code = readFileSync(join(process.cwd(), relativePath), "utf-8");
  const script = new Function(code);
  script();
}

// jsdom (from vitest config) already provides window, document, navigator, etc.
// We just need to make sure globalThis.window exists
globalThis.window = globalThis;

loadScript("src/js/error-manager.js");
loadScript("src/js/utils.js");
loadScript("src/js/tag-registry.js");
