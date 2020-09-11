'use strict';

const browsers = [
  'ie 11',
  'last 1 Chrome versions',
  'last 1 Firefox versions',
  'last 1 Safari versions',
];

/* We override the Ember 3.4 config in order to support IE 11 even in development or integration environment */
//
// const isCI = !!process.env.CI;
// const isProduction = process.env.EMBER_ENV === 'production';
//
// if (isCI || isProduction) {
//   browsers.push('ie 11');
// }

module.exports = {
  browsers,
};
