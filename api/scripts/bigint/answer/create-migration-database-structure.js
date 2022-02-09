require('dotenv').config();
const logger = require('../../../lib/infrastructure/logger');
const { knex } = require('../../../db/knex-database-connection');

async function createTemporaryTables(knex) {
  await knex.schema.createTable('answers_bigint', (t) => {
    t.bigInteger('id');
    t.text('value');
    t.string('result');
    t.integer('assessmentId').unsigned();
    t.string('challengeId');
    t.dateTime('createdAt').defaultTo(knex.fn.now());
    t.dateTime('updatedAt').defaultTo(knex.fn.now());
    t.integer('timeout');
    t.text('resultDetails');
    t.integer('timeSpent');
    t.boolean('isFocusedOut').defaultTo(false);
  });

  await knex.schema.createTable('knowledge-elements_bigint', (table) => {
    table.bigInteger('id');
    table.string('source');
    table.string('status');
    table.dateTime('createdAt').defaultTo(knex.fn.now());
    table.bigInteger('answerId').unsigned();
    table.integer('assessmentId').unsigned();
    table.string('skillId');
    table.float('earnedPix').defaultTo(0);
    table.integer('userId').unsigned();
    table.string('competenceId');
  });
}

async function createSettingsTable(knex) {
  await knex.schema.createTable('bigint-migration-settings', (table) => {
    table.string('tableName').primary();
    table.integer('startsAtId').unsigned();
    table.integer('endsAtId').unsigned();
  });
}

async function createAnswersBigintMigrationDatabaseStructures(knex) {
  await createTemporaryTables(knex);
  await createSettingsTable(knex);
}

const isLaunchedFromCommandLine = require.main === module;

async function main() {
  logger.info('Start script');
  await createAnswersBigintMigrationDatabaseStructures(knex);
  logger.info('End script');
}

if (isLaunchedFromCommandLine) {
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err);
      process.exit(1);
    }
  );
}

module.exports = { createAnswersBigintMigrationDatabaseStructures };
