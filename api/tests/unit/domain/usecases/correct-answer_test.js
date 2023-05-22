const { expect, sinon, domainBuilder } = require('../../../test-helper');
const Answer = require('../../../../lib/domain/models/Answer');
const correctAnswer = require('../../../../lib/domain/usecases/correct-answer');
const Challenge = require('../../../../lib/domain/models/Challenge');

describe('Unit | Domain | Use Cases | correct-answer', function () {
  it('should save the answer', async function () {
    const challengeRepository = { get: sinon.stub() };
    const answerRepository = { save: sinon.stub() };
    const assessmentId = 'rec1234pix1d';
    const challengeId = 'oneChallengeId';
    const answer = domainBuilder.buildAnswer({ challengeId, assessmentId, result: null, resultDetails: null });
    const validator = domainBuilder.buildValidator.ofTypeQCU();
    const challenge = domainBuilder.buildChallenge({
      id: challengeId,
      type: Challenge.Type.QCU,
      validator,
      format: 'grand',
    });

    const correctedAnswer = new Answer({ ...answer, result: 'ok' });
    const savedAnswer = Symbol('answer');

    //given
    challengeRepository.get.withArgs(challengeId).resolves(challenge);
    answerRepository.save.withArgs(correctedAnswer).resolves(savedAnswer);

    // when
    const result = await correctAnswer({
      answer,
      answerRepository,
      challengeRepository,
    });

    // then
    expect(result).to.equal(savedAnswer);
  });
});
