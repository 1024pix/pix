const { tmpdir } = require('node:os');
const baseDirectory = `${tmpdir()}/pix-api-test-coverage`;
module.exports = {
  all: true,
  reporter: ['html'],
  include: ['lib/**/*.js'],
  exclude: ['**/.eslintrc.cjs', './lib/infrastructure/validate-environment-variables.js'],
  'temp-dir': `${baseDirectory}/tmp`,
  'report-dir': `${baseDirectory}/report`,
};
