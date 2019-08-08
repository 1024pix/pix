const { expect, sinon } = require('../../../test-helper');
const findAnswerByChallengeAndAssessment = require('../../../../lib/domain/usecases/find-answer-by-challenge-and-assessment');
const { ForbiddenAccess } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | find-answer-by-challenge-and-assessment', () => {

  const challengeId = 'recChallenge';
  const assessmentId = 'assessmentId';
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
      id: challengeId,
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

  context('when user asked for answer is the user of the assessment', () => {
    it('should get the answer', () => {

      // when
      const result = findAnswerByChallengeAndAssessment({ challengeId, assessmentId, userId, answerRepository, assessmentRepository });

      // then
      return result.then((resultAnswer) => {
        expect(resultAnswer.id).to.equal(answerId);
      });
    });
  });

  context('when user asked for answer is not the user of the assessment', () => {
    it('should throw a Forbidden Access error', () => {

      // when
      const result = findAnswerByChallengeAndAssessment({ challengeId, assessmentId, userId: userId + 1 , answerRepository, assessmentRepository });

      // then
      return expect(result).to.be.rejectedWith(ForbiddenAccess);
    });
  });

});
