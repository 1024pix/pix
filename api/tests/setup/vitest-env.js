// Vite defines a built-in `BASE_URL` (its `base` option, which defaults to "/") and Vitest
// mirrors it into `process.env`, where it shadows the application's own `BASE_URL`. Because
// `process.loadEnvFile` never overrides an already-set variable, `config/config.js` would
// then keep Vite's "/" instead of reading tests/setup/.env.test — and `new URL("/")` throws.
//
// Deleting it here lets the normal configuration loading take over. This module exists only
// so the deletion is evaluated before the setup files import anything from `src/`: ESM
// imports are hoisted, so a bare statement at the top of those files would run too late.
//
// `BASE_URL` is the only collision: Vitest also injects DEV, MODE, PROD, SSR, TEST and
// VITEST*, none of which this codebase reads.
delete process.env.BASE_URL;
