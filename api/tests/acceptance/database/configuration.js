require('dotenv').config();
import { parse as parsePostgresqlConnectionString } from 'pg-connection-string';

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

export default configuration;
