const {
  createAnswersBigintMigrationDatabaseStructures,
} = require('../../../../../scripts/bigint/answer/create-migration-database-structure');
const {
  copyAnswerKeDataToTemporaryTables,
} = require('../../../../../scripts/bigint/answer/copy-answers-ke-data-to-temporary-tables-with-bigint');
const {
  addConstraintsAndIndexesToAnswersKeBigintTemporaryTables,
} = require('../../../../../scripts/bigint/answer/add-constraints-and-indexes-to-answers-ke-temporary-tables-with-bigint');
const {
  copyNewlyInsertedRowsToAnswerIdTmpBigintTables,
} = require('../../../../../scripts/bigint/answer/copy-newly-inserted-rows-to-answerId-tmp-bigint-tables');
const {
  copyAnswerKeDataInsertedBeforeTrigger,
} = require('../../../../../scripts/bigint/answer/copy-answers-ke-data-inserted-before-trigger-to-tmp-bigint-tables');

const { expect, knex } = require('../../../../test-helper');

const DatabaseBuilder = require('../../../../../db/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

describe('#copyAnswerKeDataInsertedBeforeTrigger', function () {
  it('should copy data inserted between temporary table initial load and trigger creation', async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await knex.raw('DROP TRIGGER IF EXISTS trg_answers ON answers');
    await knex.raw('DROP TRIGGER IF EXISTS "trg_knowledge-elements" ON "knowledge-elements"');

    await createAnswersBigintMigrationDatabaseStructures(knex);

    // when
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: firstAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: firstAnswerId });
    const { id: secondAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: secondAnswerId });
    await databaseBuilder.commit();

    await copyAnswerKeDataToTemporaryTables();

    const { id: assessmentId2 } = databaseBuilder.factory.buildAssessment();
    const { id: thirdAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId: assessmentId2 });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId: assessmentId2, answerId: thirdAnswerId });
    const { id: fourthAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId: assessmentId2 });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId: assessmentId2, answerId: fourthAnswerId });
    await databaseBuilder.commit();

    await addConstraintsAndIndexesToAnswersKeBigintTemporaryTables();

    await copyNewlyInsertedRowsToAnswerIdTmpBigintTables();

    // when
    await copyAnswerKeDataInsertedBeforeTrigger();

    // then
    const { rows: answersBigintCount } = await knex.raw(`SELECT COUNT(1) FROM "answers_bigint"`);
    expect(answersBigintCount[0].count).to.equal(4);
    const { rows: knowledgeElementsBigintCount } = await knex.raw(`SELECT COUNT(1) FROM "knowledge-elements_bigint"`);
    expect(knowledgeElementsBigintCount[0].count).to.equal(4);
  });

  afterEach(async function () {
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('knowledge-elements_bigint').delete();
    await knex('answers_bigint').delete();
    await knex('assessments').delete();
    await knex.raw('DROP TRIGGER IF EXISTS trg_answers ON answers');
    await knex.raw('DROP TRIGGER IF EXISTS "trg_knowledge-elements" ON "knowledge-elements"');
  });
});
