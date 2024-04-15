import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { TutorialEvaluation } from '../../../../../src/devcomp/domain/models/TutorialEvaluation.js';
import { addTutorialEvaluation } from '../../../../../src/devcomp/domain/usecases/add-tutorial-evaluation.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | add-tutorial-evaluation', function () {
  let tutorialRepository;
  let tutorialEvaluationRepository;
  let userId;

  beforeEach(function () {
    tutorialEvaluationRepository = { createOrUpdate: sinon.spy() };
    userId = 'userId';
  });

  context('when the tutorial exists', function () {
    it('should call the userSavedTutorialRepository', async function () {
      // Given
      tutorialRepository = {
        get: domainBuilder.buildTutorial,
      };
      const tutorialId = 'tutorialId';
      const status = TutorialEvaluation.statuses.LIKED;

      // When
      await addTutorialEvaluation({
        tutorialRepository,
        tutorialEvaluationRepository,
        userId,
        tutorialId,
        status,
      });

      // Then
      expect(tutorialEvaluationRepository.createOrUpdate).to.have.been.calledWithExactly({
        userId,
        tutorialId,
        status,
      });
    });
  });

  context('when the tutorial doesnt exist', function () {
    it('should throw a Domain error', async function () {
      // Given
      tutorialRepository = {
        get: async () => {
          throw new NotFoundError();
        },
      };
      const tutorialId = 'nonExistentTutorialId';

      // When
      const result = await catchErr(addTutorialEvaluation)({
        tutorialRepository,
        tutorialEvaluationRepository,
        userId,
        tutorialId,
      });

      // Then
      expect(tutorialEvaluationRepository.createOrUpdate).to.not.have.been.called;
      expect(result).to.be.instanceOf(NotFoundError);
    });
  });
});
