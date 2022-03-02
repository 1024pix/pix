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
    it('should return tutorial with user-tutorials', async function () {
      // Given
      const tutorialWithUserTutorial = domainBuilder.buildTutorialWithUserTutorial();
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      userTutorialRepository = { findWithTutorial: sinon.spy(async () => [tutorialWithUserTutorial]) };

      // When
      const tutorials = await findSavedTutorials({
        tutorialEvaluationRepository,
        userTutorialRepository,
        userId,
      });

      // Then
      expect(tutorials).to.deep.equal([tutorialWithUserTutorial]);
    });

    context('when user has evaluated a tutorial', function () {
      it('should return tutorial with user-tutorials', async function () {
        // Given
        const tutorialWithUserTutorial = domainBuilder.buildTutorialWithUserTutorial();
        const tutorialEvaluation = {
          id: 123,
          userId: tutorialWithUserTutorial.userTutorial.userId,
          tutorialId: tutorialWithUserTutorial.id,
        };
        tutorialEvaluationRepository = { find: sinon.spy(async () => [tutorialEvaluation]) };
        userTutorialRepository = { findWithTutorial: sinon.spy(async () => [{ ...tutorialWithUserTutorial }]) };

        // When
        const tutorials = await findSavedTutorials({
          tutorialEvaluationRepository,
          userTutorialRepository,
          userId,
        });

        // Then
        const expectedTutorialWithUserTutorial = {
          ...tutorialWithUserTutorial,
          tutorialEvaluation,
        };
        expect(tutorials).to.deep.equal([expectedTutorialWithUserTutorial]);
      });
    });
  });
});
