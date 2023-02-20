import { tmpdir } from 'node:os';
const baseDirectory = `${tmpdir()}/pix-api-test-coverage`;

export default {
  all: true,
  reporter: ['html'],
  include: ['lib/**/*.js'],
  exclude: ['**/.eslintrc.js', './lib/infrastructure/validate-environment-variables.js'],
  'temp-dir': `${baseDirectory}/tmp`,
  'report-dir': `${baseDirectory}/report`,
};
