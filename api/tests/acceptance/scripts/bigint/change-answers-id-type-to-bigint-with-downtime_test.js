const {
  changeAnswerIdTypeToBigint,
} = require('../../../../scripts/bigint/change-answers-id-type-to-bigint-with-downtime');
const { expect, knex } = require('../../../test-helper');
const DatabaseBuilder = require('../../../../db/database-builder/database-builder');
const databaseBuilder = new DatabaseBuilder({ knex });

describe('#changeAnswerIdTypeToBigint', function () {
  let answerIdInsertedBeforeSwitch;

  it('should insert answer with an id bigger than the maximum integer type value', async function () {
    // when
    await changeAnswerIdTypeToBigint();
    const maxValueBigIntType = '9223372036854775807';
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: answerId } = databaseBuilder.factory.buildAnswer({ id: maxValueBigIntType, assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId });
    await databaseBuilder.commit();

    // then
    expect(answerId).to.be.equal(maxValueBigIntType);
  });

  it('should change type of answer sequence from integer to bigint', async function () {
    // when
    await changeAnswerIdTypeToBigint();

    // then
    const { rows: sequenceDataType } = await knex.raw(
      `SELECT data_type FROM information_schema.sequences WHERE sequence_name = 'answers_id_seq'`
    );
    expect(sequenceDataType[0]['data_type']).to.equal('bigint');
  });

  it('should sequence are correctly reassigned', async function () {
    // given
    await changeAnswerIdTypeToBigint();

    // when
    const [{ id: answerIdInsertedAfterSwitch }] = await knex('answers')
      .insert({
        value: 'Some value for answer',
        result: 'Some result for answer',
        challengeId: 'rec123ABC',
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-02'),
        resultDetails: 'Some result details for answer.',
        timeSpent: 30,
      })
      .returning('id');

    // then
    expect(answerIdInsertedAfterSwitch).to.equal(answerIdInsertedBeforeSwitch + 1);
  });

  afterEach(async function () {
    await knex.transaction(async (trx) => {
      await knex.raw(`ALTER TABLE "knowledge-elements" ALTER COLUMN "answerId" TYPE INTEGER`).transacting(trx);
      await knex.raw(`ALTER TABLE "flash-assessment-results" ALTER COLUMN "answerId" TYPE INTEGER`).transacting(trx);
      await knex.raw(`ALTER TABLE "answers" ALTER COLUMN "id" TYPE INTEGER`).transacting(trx);
      await knex.raw(`ALTER SEQUENCE "answers_id_seq" AS INTEGER`).transacting(trx);
    });
  });
});
