/**
 * Template version injected at build time via esbuild --define.
 * Returns 'dev' for local development, actual version (e.g., 'v1.2.0') for releases.
 * @type {string}
 */
export const TEMPLATE_VERSION =
  typeof __TEMPLATE_VERSION__ !== "undefined" ? __TEMPLATE_VERSION__ : "dev";
