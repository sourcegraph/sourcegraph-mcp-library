/**
 * Global playback-pacing knobs for the scripted demo.
 *
 * Tweak these to make every scenario render faster or slower; per-scenario
 * timeline files should not need to think about pacing beyond their own
 * `at` timestamps.
 *
 * The metrics-bar fade-in duration lives alongside these as a CSS variable
 * (`--metrics-reveal-duration` in `src/styles/tokens.css`) because CSS
 * transitions can't read JS constants directly. Keep the two in sync if you
 * want a different reveal feel.
 */

/** Characters revealed per typewriter tick during assistant streaming. */
export const STREAM_CHARS_PER_TICK = 6;

/** Milliseconds between typewriter ticks. */
export const STREAM_CHUNK_MS = 12;

/**
 * Delay (ms) between the last visible content rendering and the metrics
 * bar / quality breakdown appearing. The per-scenario `complete.at` is
 * ignored in favor of `last-content-render-end + COMPLETE_BUFFER_MS`.
 */
export const COMPLETE_BUFFER_MS = 1000;

/** Extra grace after `complete` fires before `isPlaying` flips to false. */
export const PLAYBACK_TAIL_MS = 100;
