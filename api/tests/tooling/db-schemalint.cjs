module.exports = {
  connection: {
    connectionString: process.env.DATABASE_URL,
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
