import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { Answer } from '../../../../lib/domain/models/Answer.js';
import { correctAnswer } from '../../../../lib/domain/usecases/correct-answer.js';
import { Challenge } from '../../../../lib/domain/models/Challenge.js';

describe('Unit | Domain | Use Cases | correct-answer', function () {
  it('should save the answer', async function () {
    const challengeRepository = { get: sinon.stub() };
    const answerRepository = { save: sinon.stub() };
    const activityRepository = { getLastActivity: sinon.stub() };
    const assessmentId = 'rec1234pix1d';
    const challengeId = 'oneChallengeId';
    const activityId = '123';
    const answer = domainBuilder.buildAnswer({ challengeId, assessmentId, result: null, resultDetails: null });
    const validator = domainBuilder.buildValidator.ofTypeQCU();
    const challenge = domainBuilder.buildChallenge({
      id: challengeId,
      type: Challenge.Type.QCU,
      validator,
      format: 'grand',
    });

    const correctedAnswer = new Answer({ ...answer, result: 'ok', activityId });
    const savedAnswer = Symbol('answer');

    //given
    challengeRepository.get.withArgs(challengeId).resolves(challenge);
    activityRepository.getLastActivity.withArgs(assessmentId).resolves({ id: activityId });
    answerRepository.save.resolves(savedAnswer);

    // when
    const result = await correctAnswer({
      answer,
      answerRepository,
      challengeRepository,
      activityRepository,
    });

    // then
    expect(answerRepository.save).to.have.been.calledWithMatch(correctedAnswer);
    expect(result).to.equal(savedAnswer);
  });
});
