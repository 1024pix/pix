// `./vitest-env.js` clears the env vars Vite injects and must run before anything from
// `src/` reads the configuration.
import './vitest-env.js';

import { mochaHooks } from './integration.js';
import { registerMochaHooks } from './vitest-hooks.js';

registerMochaHooks(mochaHooks);
