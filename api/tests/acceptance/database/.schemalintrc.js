require('dotenv').config();
const pgUrlParser = require('pg-connection-string').parse;

const whiteList = [
  ...require('./whitelist/column-name-casing'),
  ...require('./whitelist/name-inflection'),
  ...require('./whitelist/table-name-casing'),
  ...require('./whitelist/identifier-naming'),
  ...require('./whitelist/library-tables'),
];

const errorLevel = {
  'name-inflection': ['error', 'plural'],
  'identifier-naming': ['error'],
  'table-name-casing': ['error'],
  'column-name-casing': ['error'],
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
