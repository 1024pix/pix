module.exports = {
  connection: {
    connectionString: process.env.TEST_DATABASE_URL,
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
