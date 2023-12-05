import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { correctAnswer } from '../../../../lib/domain/usecases/correct-answer.js';
import { Challenge } from '../../../../src/shared/domain/models/Challenge.js';
import { ActivityAnswer } from '../../../../src/school/domain/models/ActivityAnswer.js';
import { AnswerStatus } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | correct-answer', function () {
  context('When there is assessmentId', function () {
    it('should save the answer', async function () {
      const challengeRepository = { get: sinon.stub() };
      const activityAnswerRepository = { save: sinon.stub() };
      const activityRepository = { getLastActivity: sinon.stub() };
      const assessmentId = 'rec1234pix1d';
      const challengeId = 'oneChallengeId';
      const activityId = '123';
      const activityAnswer = domainBuilder.buildActivityAnswer({
        challengeId,
        activityId: null,
        result: null,
        resultDetails: null,
      });
      const validator = domainBuilder.buildValidator.ofTypeQCU();
      const challenge = domainBuilder.buildChallenge({
        id: challengeId,
        type: Challenge.Type.QCU,
        validator,
        format: 'grand',
      });

      const correctedAnswer = new ActivityAnswer({ ...activityAnswer, result: AnswerStatus.OK, activityId });
      const savedAnswer = Symbol('answer');

      //given
      challengeRepository.get.withArgs(challengeId).resolves(challenge);
      activityRepository.getLastActivity.withArgs(assessmentId).resolves({ id: activityId });
      activityAnswerRepository.save.resolves(savedAnswer);

      // when
      const result = await correctAnswer({
        activityAnswer,
        assessmentId,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });

      // then
      expect(activityAnswerRepository.save).to.have.been.calledWithMatch(correctedAnswer);
      expect(result).to.equal(savedAnswer);
    });
  });
  context('When there is no assessmentId', function () {
    it('should save the answer', async function () {
      const challengeRepository = { get: sinon.stub() };
      const activityAnswerRepository = { save: sinon.stub() };
      const activityRepository = { getLastActivity: sinon.stub() };
      const assessmentId = null;
      const challengeId = 'oneChallengeId';
      const activityId = null;
      const activityAnswer = domainBuilder.buildActivityAnswer({
        challengeId,
        activityId,
        result: null,
        resultDetails: null,
      });
      const validator = domainBuilder.buildValidator.ofTypeQCU();
      const challenge = domainBuilder.buildChallenge({
        id: challengeId,
        type: Challenge.Type.QCU,
        validator,
        format: 'grand',
      });

      const correctedAnswer = new ActivityAnswer({ ...activityAnswer, result: AnswerStatus.OK, activityId });
      const savedAnswer = Symbol('answer');

      //given
      challengeRepository.get.withArgs(challengeId).resolves(challenge);
      activityAnswerRepository.save.resolves(savedAnswer);

      // when
      const result = await correctAnswer({
        activityAnswer,
        assessmentId,
        activityAnswerRepository,
        challengeRepository,
        activityRepository,
      });

      // then
      expect(activityRepository.getLastActivity).to.not.have.been.called;
      expect(activityAnswerRepository.save).to.have.been.calledWithMatch(correctedAnswer);
      expect(result).to.equal(savedAnswer);
    });
  });
});
