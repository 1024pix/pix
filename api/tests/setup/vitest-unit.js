// `./unit.js` sets the fake database URLs at module scope and only then dynamically imports
// `common.js`, so it must stay the first import: nothing from `src/` may be evaluated before
// the fake connection strings are in place.
import { mochaHooks } from './unit.js';
import { registerMochaHooks } from './vitest-hooks.js';

registerMochaHooks(mochaHooks);
