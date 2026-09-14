// Import order matters here. `./vitest-env.js` clears the env vars Vite injects, and
// `./unit.js` sets the fake database URLs at module scope before dynamically importing
// `common.js` — both must run before anything from `src/` is evaluated.
import './vitest-env.js';

import { mochaHooks } from './unit.js';
import { registerMochaHooks } from './vitest-hooks.js';

registerMochaHooks(mochaHooks);
