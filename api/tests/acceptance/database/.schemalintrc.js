require('dotenv').config();
const pgUrlParser = require('pg-connection-string').parse;

const whiteList = [
  ...require('./whitelist/prefer-text-to-varchar'),
  ...require('./whitelist/require-primary-key'),
  ...require('./whitelist/column-name-casing'),
  ...require('./whitelist/name-inflection'),
  ...require('./whitelist/prefer-jsonb-to-json'),
  ...require('./whitelist/table-name-casing'),
  ...require('./whitelist/identifier-naming'),
  ...require('./whitelist/foreign-key-to-id'),
  ...require('./whitelist/library-tables'),
  ...require('./whitelist/default-varchar-length'),
];

const errorLevel = {
  'name-inflection': ['error', 'plural'],
  'prefer-jsonb-to-json': ['error'],
  'prefer-text-to-varchar': ['error'],
  'require-primary-key': ['error'],
  'prefer-timestamptz-to-timestamp': ['error'],
  'identifier-naming': ['error'],
  'table-name-casing': ['error'],
  'column-name-casing': ['error'],
  'foreign-key-to-id': ['error'],
  'default-varchar-length': ['error'],
}

const rules = {
  customRulesPath: './tests/acceptance/database/custom-rules',
  whiteList,
  errorLevel
}

const databaseToLint = {
  connectString: pgUrlParser(process.env.TEST_DATABASE_URL),
  schema: [{name: 'public'}]
}

const config = {
  connection: databaseToLint.connectString,
  schemas: databaseToLint.schema,
  rules: rules.errorLevel,
  ignores: rules.whiteList,
  plugins: [rules.customRulesPath],
}

module.exports = config;
