const { expect, knex, databaseBuilder } = require('../../../test-helper');

describe('#changeAnswerIdTypeToBigint', function () {
  it('should insert answer with an id bigger than the maximum integer type value', async function () {
    // when migration 20220721115757_alter-answers-id-from-int-to-bigint.js is done
    const maxValueBigIntType = '9223372036854775807';
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment();
    const { id: answerId } = databaseBuilder.factory.buildAnswer({ id: maxValueBigIntType, assessmentId });
    databaseBuilder.factory.buildKnowledgeElement({ assessmentId, answerId });
    await databaseBuilder.commit();

    // then
    expect(answerId).to.be.equal(maxValueBigIntType);
  });

  it('should change type of answer sequence from integer to bigint', async function () {
    // when migration 20220721115757_alter-answers-id-from-int-to-bigint.js is done
    // then
    const { rows: sequenceDataType } = await knex.raw(
      `SELECT data_type FROM information_schema.sequences WHERE sequence_name = 'answers_id_seq'`
    );
    expect(sequenceDataType[0]['data_type']).to.equal('bigint');
  });

  it('should reassign sequences', async function () {
    // given
    const [{ id: answerIdInsertedBeforeSwitch }] = await knex('answers')
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

    // when migration 20220721115757_alter-answers-id-from-int-to-bigint.js is done
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
    await knex.from('answers').delete().whereIn('id', [answerIdInsertedBeforeSwitch, answerIdInsertedAfterSwitch]);
  });
});
