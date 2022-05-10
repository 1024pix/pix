const {
  createAnswersBigintMigrationDatabaseStructures,
} = require('../../../../../scripts/bigint/answer/create-migration-database-structure');
const { expect, knex } = require('../../../../test-helper');

describe('#createAnswersBigintMigrationDatabaseStructures', function () {
  it('should create temporary tables', async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');

    // when
    await createAnswersBigintMigrationDatabaseStructures(knex);

    // then
    const { rowCount: answersTableCount } = await knex.raw(
      `SELECT COUNT(1) FROM information_schema.tables t WHERE t.table_type = 'BASE TABLE' AND t.table_name = 'answers_bigint'`
    );
    expect(answersTableCount).to.equal(1);

    const { rowCount: knowledgeElementsTableCount } = await knex.raw(
      `SELECT COUNT(1) FROM information_schema.tables t WHERE t.table_type = 'BASE TABLE' AND t.table_name = 'bigint-migration-settings'`
    );
    expect(knowledgeElementsTableCount).to.equal(1);
  });
  it('should create settings table', async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');

    // when
    await createAnswersBigintMigrationDatabaseStructures(knex);

    // then
    const { rowCount: migrationSettingsTableCount } = await knex.raw(
      `SELECT COUNT(1) FROM information_schema.tables t WHERE t.table_type = 'BASE TABLE' AND t.table_name = 'bigint-migration-settings'`
    );
    expect(migrationSettingsTableCount).to.equal(1);
  });
});
