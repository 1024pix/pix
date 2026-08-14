module.exports = {
  require: ['./tests/setup/index.js'],
  recursive: true,
  exit: true,
  timeout: 5000,
  reporter: process.env.MOCHA_REPORTER ?? 'dot',
  retries: Number(process.env.MOCHA_RETRIES ?? 0),
};
