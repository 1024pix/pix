const {
  createAnswersBigintMigrationDatabaseStructures,
} = require('../../../../../scripts/bigint/answer/create-migration-database-structure');
const {
  copyAnswerKeDataToTemporaryTables,
} = require('../../../../../scripts/bigint/answer/copy-answers-ke-data-to-temporary-tables-with-bigint');
const { expect, knex } = require('../../../../test-helper');

const DatabaseBuilder = require('../../../../../db/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

describe('#copyAnswerKeDataToTemporaryTables', function () {
  it('should copy data from tables to temporary tables', async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await createAnswersBigintMigrationDatabaseStructures(knex);

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: firstAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: firstAnswerId });
    const { id: secondAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: secondAnswerId });

    await databaseBuilder.commit();

    // when
    await copyAnswerKeDataToTemporaryTables();

    // then
    const { rows: answersBigintCount } = await knex.raw(`SELECT COUNT(1) FROM "answers_bigint"`);
    expect(answersBigintCount[0].count).to.equal(2);
    const { rows: knowledgeElementsBigintCount } = await knex.raw(`SELECT COUNT(1) FROM "knowledge-elements_bigint"`);
    expect(knowledgeElementsBigintCount[0].count).to.equal(2);
  });
  it('should copy both tables or nothing', async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await createAnswersBigintMigrationDatabaseStructures(knex);
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    databaseBuilder.factory.buildAnswer({ assessmentId });
    await databaseBuilder.commit();

    // when
    let error;
    try {
      await copyAnswerKeDataToTemporaryTables();
    } catch (err) {
      error = err;
    }

    // then
    expect(error.message).to.have.string('relation "knowledge-elements_bigint" does not exist');
    const { rows: answersBigintCount } = await knex.raw(`SELECT COUNT(1) FROM "answers_bigint"`);
    expect(answersBigintCount[0].count).to.equal(0);
  });

  afterEach(async function () {
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('assessments').delete();
  });
});
