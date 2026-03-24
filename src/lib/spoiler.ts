/**
 * Per-request timestamp for spoiler UI (24h window). Call once at the top of a server page.
 */
export function getSpoilerCutoffMs(): number {
  return Date.now();
}
