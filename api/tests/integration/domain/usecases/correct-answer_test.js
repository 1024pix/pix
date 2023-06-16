import { expect, knex, domainBuilder, sinon, databaseBuilder } from '../../../test-helper.js';
import { correctAnswer } from '../../../../lib/domain/usecases/correct-answer.js';
import * as answerRepository from '../../../../lib/infrastructure/repositories/answer-repository.js';

describe('Integration | UseCases | correct-answer', function () {
  let createdAnswerRecordId;
  afterEach(async function () {
    await knex('answers').where({ id: createdAnswerRecordId }).delete();
  });

  it('returns newly created answer', async function () {
    // given
    const challenge = domainBuilder.buildChallenge();
    const challengeRepository = { get: sinon.stub().resolves(challenge) };

    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({});
    await databaseBuilder.commit();

    const answer = domainBuilder.buildAnswer({
      id: null,
      challengeId: challenge.id,
      assessmentId,
    });

    // when
    const record = await correctAnswer({ answer, challengeRepository, answerRepository });

    // For cleanup purpose
    createdAnswerRecordId = record.id;

    const savedAnswer = await knex('answers').where({ id: record.id }).first();

    // then
    expect(savedAnswer.challengeId).to.equal(challenge.id);
    expect(savedAnswer.assessmentId).to.equal(assessmentId);
  });
});
