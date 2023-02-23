const dotenv = require('dotenv');
dotenv.config();
const parsePostgresqlConnectionString = require('pg-connection-string').parse;

const databaseToLint = {
  connexion: parsePostgresqlConnectionString(process.env.TEST_DATABASE_URL),
  schema: [{ name: 'public' }],
};

const rules = {
  settings: {
    'name-inflection': ['error', 'plural'],
  },
  ignores: [
    { identifierPattern: 'public\\.knex*.*', rulePattern: '.*' },
    { identifierPattern: 'public\\.badge-criteria', rulePattern: 'name-inflection' },
  ],
};

const configuration = {
  connection: databaseToLint.connexion,
  schemas: databaseToLint.schema,
  rules: rules.settings,
  ignores: rules.ignores,
};

module.exports = configuration;
