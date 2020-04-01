const { expect, sinon } = require('../../../test-helper');
const findAnswerByAssessment = require('../../../../lib/domain/usecases/find-answer-by-assessment');

describe('Unit | UseCase | find-answer-by-challenge-and-assessment', () => {

  const assessmentId = 123;
  const userId = 'userId';
  let answerRepository, assessmentRepository, answers;

  beforeEach(() => {
    answers =
      [{
        id: 1,
        assessmentId,
      },
      {
        id: 2,
        assessmentId,
      }];
    const assessment = {
      id: assessmentId,
      userId: userId,
    };

    answerRepository = {
      findByAssessment: sinon.stub(),
    };

    assessmentRepository = {
      get: sinon.stub(),
    };

    answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
    assessmentRepository.get.withArgs(assessmentId).resolves(assessment);
  });

  context('when the assessmentid passed is not an integer', () => {
    it('should return empty array', async () => {
      // when
      const result = await findAnswerByAssessment({ assessmentId: 'salut', userId, answerRepository, assessmentRepository });

      // then
      return expect(result).to.deep.equal([]);
    });
  });

  context('when user asked for answer is the user of the assessment', () => {
    it('should get the answer', async () => {

      // when
      const resultAnswers = await findAnswerByAssessment({ assessmentId, userId, answerRepository, assessmentRepository });

      // then
      expect(resultAnswers).to.deep.equal(answers);
    });
  });

  context('when user asked for answer is not the user of the assessment', () => {
    it('should return empty array', async () => {
      // when
      const result = await findAnswerByAssessment({ assessmentId, userId: userId + 1 , answerRepository, assessmentRepository });

      // then
      return expect(result).to.deep.equal([]);
    });
  });

});
