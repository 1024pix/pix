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

const { expect, knex } = require('../../../../test-helper');

const DatabaseBuilder = require('../../../../../db/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

describe('#copyNewlyInsertedRowsToAnswerIdTmpBigintTables', function () {
  beforeEach(async function () {
    // given
    await knex.raw('DROP TABLE IF EXISTS "bigint-migration-settings"');
    await knex.raw('DROP TABLE IF EXISTS "knowledge-elements_bigint"');
    await knex.raw('DROP TABLE IF EXISTS "answers_bigint"');
    await knex.raw('DROP TRIGGER IF EXISTS trg_answers ON answers');
    await knex.raw('DROP TRIGGER IF EXISTS "trg_knowledge-elements" ON "knowledge-elements"');
    await createAnswersBigintMigrationDatabaseStructures(knex);
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: firstAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: firstAnswerId });
    const { id: secondAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: secondAnswerId });
    await databaseBuilder.commit();
    await copyAnswerKeDataToTemporaryTables();
    await addConstraintsAndIndexesToAnswersKeBigintTemporaryTables();

    // when
    await copyNewlyInsertedRowsToAnswerIdTmpBigintTables();
  });

  it('should add triggers to answers and KE tables', async function () {
    // then
    const { rows: triggersByTable } = await knex.raw(
      `SELECT  event_object_table AS table_name ,trigger_name
             FROM information_schema.triggers
             GROUP BY table_name , trigger_name
             ORDER BY table_name ,trigger_name
            `
    );
    expect(triggersByTable).to.deep.equal([
      {
        table_name: 'answers',
        trigger_name: 'trg_answers',
      },
      {
        table_name: 'knowledge-elements',
        trigger_name: 'trg_knowledge-elements',
      },
    ]);
  });

  it('should copy newly inserted rows from base tables into bigint temporary tables', async function () {
    // given
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: firstAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: firstAnswerId });
    const { id: secondAnswerId } = databaseBuilder.factory.buildAnswer({ assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId: secondAnswerId });
    await databaseBuilder.commit();

    // when then
    const { rows: answersBigintCount } = await knex.raw(`SELECT COUNT(1) FROM "answers_bigint"`);
    expect(answersBigintCount[0].count).to.equal(4);
    const { rows: knowledgeElementsBigintCount } = await knex.raw(`SELECT COUNT(1) FROM "knowledge-elements_bigint"`);
    expect(knowledgeElementsBigintCount[0].count).to.equal(4);
  });

  it('should persist last temporary table identifier into settings table', async function () {
    const { answerBigIntMaxId } = await knex('answers_bigint').max('id as answerBigIntMaxId').first();
    const { startsAtId: currentStartsAtId } = await knex('bigint-migration-settings')
      .where({
        tableName: 'answers',
      })
      .select('startsAtId')
      .first();
    const expectedStartsAtId = answerBigIntMaxId + 1;
    expect(currentStartsAtId).to.equal(expectedStartsAtId);

    const { knowledgeElementsBigintMaxId } = await knex('knowledge-elements_bigint')
      .max('id as knowledgeElementsBigintMaxId')
      .first();
    const { startsAtId: currentStartsAtIdKe } = await knex('bigint-migration-settings')
      .where({
        tableName: 'knowledge-elements',
      })
      .select('startsAtId')
      .first();
    const expectedStartsAtIdKe = knowledgeElementsBigintMaxId + 1;
    expect(currentStartsAtIdKe).to.equal(expectedStartsAtIdKe);
  });

  it('should persist last source table identifier into settings table', async function () {
    const { answerMaxId } = await knex('answers').max('id as answerMaxId').first();
    const { endsAtId: currentEndsAtId } = await knex('bigint-migration-settings')
      .where({
        tableName: 'answers',
      })
      .select('endsAtId')
      .first();
    const expectedEndsAtId = answerMaxId;
    expect(currentEndsAtId).to.equal(expectedEndsAtId);

    const { knowledgeElementsMaxId } = await knex('knowledge-elements').max('id as knowledgeElementsMaxId').first();
    const { endsAtId: currentEndsAtIdKe } = await knex('bigint-migration-settings')
      .where({
        tableName: 'knowledge-elements',
      })
      .select('endsAtId')
      .first();
    const expectedEndsAtIdKe = knowledgeElementsMaxId;
    expect(currentEndsAtIdKe).to.equal(expectedEndsAtIdKe);
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
