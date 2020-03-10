const { expect, sinon } = require('../../../test-helper');
const findAnswerByChallengeAndAssessment = require('../../../../lib/domain/usecases/find-answer-by-challenge-and-assessment');

describe('Unit | UseCase | find-answer-by-challenge-and-assessment', () => {

  const challengeId = 'recChallenge';
  const assessmentId = 123;
  const answerId = 'answerId';
  const userId = 'userId';
  let answerRepository, assessmentRepository;

  beforeEach(() => {
    const answer = {
      id: answerId,
      assessmentId,
      challengeId
    };
    const assessment = {
      id: assessmentId,
      userId: userId,
    };

    answerRepository = {
      findByChallengeAndAssessment: sinon.stub(),
    };

    assessmentRepository = {
      get: sinon.stub(),
    };

    answerRepository.findByChallengeAndAssessment.withArgs({ challengeId, assessmentId }).resolves(answer);
    assessmentRepository.get.withArgs(assessmentId).resolves(assessment);
  });

  context('when the assessmentid passed is not an integer', () => {
    it('should get the answer', async () => {
      // when
      const result = await findAnswerByChallengeAndAssessment({ challengeId, assessmentId: 'salut', userId, answerRepository, assessmentRepository });

      // then
      return expect(result).to.be.null;
    });
  });

  context('when user asked for answer is the user of the assessment', () => {
    it('should get the answer', async () => {

      // when
      const resultAnswer = await findAnswerByChallengeAndAssessment({ challengeId, assessmentId, userId, answerRepository, assessmentRepository });

      // then
      expect(resultAnswer.id).to.equal(answerId);
    });
  });

  context('when user asked for answer is not the user of the assessment', () => {
    it('should return null', async () => {
      // when
      const result = await findAnswerByChallengeAndAssessment({ challengeId, assessmentId, userId: userId + 1 , answerRepository, assessmentRepository });

      // then
      return expect(result).to.be.null;
    });
  });

});
