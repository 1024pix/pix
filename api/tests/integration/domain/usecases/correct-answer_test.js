const { expect, knex, domainBuilder, sinon } = require('../../../test-helper');
const correctAnswer = require('../../../../lib/domain/usecases/correct-answer');
const answerRepository = require('../../../../lib/infrastructure/repositories/answer-repository');

describe('Integration | UseCases | create-answer', function () {
  afterEach(async function () {
    await knex('answers').delete();
  });

  it('returns newly created answer', async function () {
    // given
    const challenge = domainBuilder.buildChallenge();
    const challengeRepository = { get: sinon.stub().resolves(challenge) };

    const answer = domainBuilder.buildAnswer({
      id: null,
      challengeId: challenge.id,
      assessmentId: null,
    });
    const dependencies = { challengeRepository, answerRepository };

    // when
    const record = await correctAnswer({ answer, ...dependencies });
    const savedAnswer = await knex('answers').where({ id: record.id }).first();

    // then
    expect(savedAnswer.challengeId).to.equal(challenge.id);
    expect(savedAnswer.assessmentId).to.equal(null);
  });
});
