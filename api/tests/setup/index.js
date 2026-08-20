const SETUPS = {
  unit: './unit.js',
  integration: './integration.js',
  acceptance: './acceptance.js',
};

const MODES = Object.keys(SETUPS);
const FALLBACK_MODE = 'acceptance';

function classify(spec) {
  const match = spec.match(/(?:^|\/)(unit|integration|acceptance)(?:\/|$)/);
  return match?.[1];
}

// Infers which setup mode to load from the test paths given to mocha. (fallback to acceptance)
function inferMode(args) {
  const specs = args.filter((arg) => !arg.startsWith('-'));
  const types = new Set(specs.map(classify).filter(Boolean));

  const setupMode = types.size === 1 ? [...types][0] : FALLBACK_MODE;

  // eslint-disable-next-line no-console
  console.log(`Running with "${setupMode}" setup mode`);

  return setupMode;
}

// Override the mode from the environment variable, or infer it from the test paths given to mocha.
process.env.TEST_SETUP_MODE ??= inferMode(process.argv.slice(2));

const mode = process.env.TEST_SETUP_MODE;

if (!MODES.includes(mode)) {
  throw new Error(`Unknown test setup mode "${mode}". Set TEST_SETUP_MODE to one of: ${MODES.join(', ')}.`);
}

export const { mochaHooks } = await import(SETUPS[mode]);
