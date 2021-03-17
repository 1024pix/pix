'use strict';

const MODERN_SCRIPT = process.env.MODERN_SCRIPT === 'true';

const browsers = [
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions',
];

const isCI = Boolean(process.env.CI);
const isProduction = process.env.EMBER_ENV === 'production';

if (isCI || isProduction) {
  browsers.push('ie 9');
}

if (MODERN_SCRIPT) {
  module.exports = {
    esmodules: true,
  };
} else {
  module.exports = {
    browsers,
  };
}
