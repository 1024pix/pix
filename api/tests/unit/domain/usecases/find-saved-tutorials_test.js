const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findSavedTutorials = require('../../../../lib/domain/usecases/find-saved-tutorials');

describe('Unit | UseCase | find-saved-tutorials', function () {
  let tutorialEvaluationRepository;
  let userTutorialRepository;
  const userId = 'userId';

  context('when there is no tutorial saved by current user', function () {
    beforeEach(function () {
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      userTutorialRepository = { findWithTutorial: sinon.spy(async () => []) };
    });

    it('should call the userTutorialRepository', async function () {
      // When
      await findSavedTutorials({ tutorialEvaluationRepository, userTutorialRepository, userId });

      // Then
      expect(userTutorialRepository.findWithTutorial).to.have.been.calledWith({ userId });
    });

    it('should return an empty array', async function () {
      // When
      const tutorials = await findSavedTutorials({
        tutorialEvaluationRepository,
        userTutorialRepository,
        userId,
      });

      // Then
      expect(tutorials).to.deep.equal([]);
    });
  });

  context('when there is one tutorial saved by current user', function () {
    it('should return user-tutorials with tutorials', async function () {
      // Given
      const userTutorialWithTutorial = domainBuilder.buildUserSavedTutorialWithTutorial();
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      userTutorialRepository = { findWithTutorial: sinon.spy(async () => [userTutorialWithTutorial]) };

      // When
      const tutorials = await findSavedTutorials({
        tutorialEvaluationRepository,
        userTutorialRepository,
        userId,
      });

      // Then
      expect(tutorials).to.deep.equal([userTutorialWithTutorial]);
    });

    context('when user has evaluated a tutorial', function () {
      it('should return user-tutorials with tutorials', async function () {
        // Given
        const userId = 456;
        const tutorial = domainBuilder.buildTutorial();
        const userTutorialWithTutorial = domainBuilder.buildUserSavedTutorialWithTutorial({ userId, tutorial });
        const tutorialEvaluation = {
          id: 123,
          userId,
          tutorialId: tutorial.id,
        };
        tutorialEvaluationRepository = { find: sinon.spy(async () => [tutorialEvaluation]) };
        userTutorialRepository = { findWithTutorial: sinon.spy(async () => [{ ...userTutorialWithTutorial }]) };

        // When
        const tutorials = await findSavedTutorials({
          tutorialEvaluationRepository,
          userTutorialRepository,
          userId,
        });

        // Then
        const expectedUserTutorialWithTutorial = {
          ...userTutorialWithTutorial,
          tutorial: { ...tutorial, tutorialEvaluation },
        };
        expect(tutorials).to.deep.equal([expectedUserTutorialWithTutorial]);
      });
    });
  });
});
