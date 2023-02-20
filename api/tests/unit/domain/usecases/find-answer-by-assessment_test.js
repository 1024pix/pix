import { expect, sinon, catchErr } from '../../../test-helper';
import findAnswerByAssessment from '../../../../lib/domain/usecases/find-answer-by-assessment';
import { UserNotAuthorizedToAccessEntityError, EntityValidationError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | find-answer-by-challenge-and-assessment', function () {
  const assessmentId = 123;
  const userId = 'userId';
  let answerRepository, assessmentRepository, answers;

  beforeEach(function () {
    answers = [
      {
        id: 1,
        assessmentId,
      },
      {
        id: 2,
        assessmentId,
      },
    ];
    const assessment = {
      id: assessmentId,
      userId: userId,
    };

    answerRepository = {
      findByAssessment: sinon.stub(),
    };

    assessmentRepository = {
      ownedByUser: sinon.stub(),
    };

    answerRepository.findByAssessment.withArgs(assessmentId).resolves(answers);
    assessmentRepository.ownedByUser.withArgs({ id: assessmentId, userId }).resolves(assessment);
  });

  context('when the assessmentid passed is not an integer', function () {
    it('should throw an error', async function () {
      // when
      const error = await catchErr(findAnswerByAssessment)({
        assessmentId: 'salut',
        userId,
        answerRepository,
        assessmentRepository,
      });

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
      expect(error.invalidAttributes[0].attribute).to.equal('assessmentId');
      expect(error.invalidAttributes[0].message).to.equal('This assessment ID is not valid.');
    });
  });

  context('when user asked for answer is the user of the assessment', function () {
    it('should get the answer', async function () {
      // when
      const resultAnswers = await findAnswerByAssessment({
        assessmentId,
        userId,
        answerRepository,
        assessmentRepository,
      });

      // then
      expect(resultAnswers).to.deep.equal(answers);
    });
  });

  context('when user asked for answer is not the user of the assessment', function () {
    it('should return empty array', async function () {
      // when
      const result = await catchErr(findAnswerByAssessment)({
        assessmentId,
        userId: userId + 1,
        answerRepository,
        assessmentRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
    });
  });
});
