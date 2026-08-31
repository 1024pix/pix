const { config } = require('../../src/shared/config.js');

module.exports = {
  connection: {
    connectionString: config.database.liveUrl,
  },
  schemas: [{ name: 'public' }],
  rules: {
    'name-inflection': ['error', 'plural'],
  },
  ignores: [
    { identifierPattern: 'public\\.knex*.*', rulePattern: '.*' },
    { identifierPattern: 'public\\.badge-criteria', rulePattern: 'name-inflection' },
  ],
};
