import { expect, knex, databaseBuilder } from '../../../test-helper';

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
});
