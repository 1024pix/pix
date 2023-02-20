import { expect, sinon } from '../../../test-helper';
import findAnswerByChallengeAndAssessment from '../../../../lib/domain/usecases/find-answer-by-challenge-and-assessment';

describe('Unit | UseCase | find-answer-by-challenge-and-assessment', function () {
  const challengeId = 'recChallenge';
  const assessmentId = 123;
  const answerId = 'answerId';
  const userId = 'userId';
  let answerRepository, assessmentRepository;

  beforeEach(function () {
    const answer = {
      id: answerId,
      assessmentId,
      challengeId,
    };
    const assessment = {
      id: assessmentId,
      userId: userId,
    };

    answerRepository = {
      findByChallengeAndAssessment: sinon.stub(),
    };

    assessmentRepository = {
      ownedByUser: sinon.stub(),
    };

    answerRepository.findByChallengeAndAssessment.withArgs({ challengeId, assessmentId }).resolves(answer);
    assessmentRepository.ownedByUser.withArgs({ id: assessmentId, userId }).resolves(assessment);
  });

  context('when the assessmentid passed is not an integer', function () {
    it('should get the answer', async function () {
      // when
      const result = await findAnswerByChallengeAndAssessment({
        challengeId,
        assessmentId: 'salut',
        userId,
        answerRepository,
        assessmentRepository,
      });

      // then
      return expect(result).to.be.null;
    });
  });

  context('when user asked for answer is the user of the assessment', function () {
    it('should get the answer', async function () {
      // when
      const resultAnswer = await findAnswerByChallengeAndAssessment({
        challengeId,
        assessmentId,
        userId,
        answerRepository,
        assessmentRepository,
      });

      // then
      expect(resultAnswer.id).to.equal(answerId);
    });
  });

  context('when user asked for answer is not the user of the assessment', function () {
    it('should return null', async function () {
      // when
      const result = await findAnswerByChallengeAndAssessment({
        challengeId,
        assessmentId,
        userId: userId + 1,
        answerRepository,
        assessmentRepository,
      });

      // then
      return expect(result).to.be.null;
    });
  });
});
