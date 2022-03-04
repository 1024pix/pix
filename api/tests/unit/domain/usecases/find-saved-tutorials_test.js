const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findSavedTutorials = require('../../../../lib/domain/usecases/find-saved-tutorials');

describe('Unit | UseCase | find-saved-tutorials', function () {
  let tutorialEvaluationRepository;
  let tutorialRepository;
  const userId = 'userId';

  context('when there is no tutorial saved by current user', function () {
    beforeEach(function () {
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      tutorialRepository = { findWithUserTutorialForCurrentUser: sinon.spy(async () => []) };
    });

    it('should call the tutorialRepository', async function () {
      // When
      await findSavedTutorials({ tutorialEvaluationRepository, tutorialRepository, userId });

      // Then
      expect(tutorialRepository.findWithUserTutorialForCurrentUser).to.have.been.calledWith({ userId });
    });

    it('should return an empty array', async function () {
      // When
      const tutorials = await findSavedTutorials({
        tutorialEvaluationRepository,
        tutorialRepository,
        userId,
      });

      // Then
      expect(tutorials).to.deep.equal([]);
    });
  });

  context('when there is one tutorial saved by current user', function () {
    it('should return tutorial with user-tutorials', async function () {
      // Given
      const tutorialWithUserSavedTutorial = domainBuilder.buildTutorialWithUserSavedTutorial();
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      tutorialRepository = {
        findWithUserTutorialForCurrentUser: sinon.spy(async () => [tutorialWithUserSavedTutorial]),
      };

      // When
      const tutorials = await findSavedTutorials({
        tutorialEvaluationRepository,
        tutorialRepository,
        userId,
      });

      // Then
      expect(tutorials).to.deep.equal([tutorialWithUserSavedTutorial]);
    });

    context('when user has evaluated a tutorial', function () {
      it('should return tutorial with user-tutorials', async function () {
        // Given
        const tutorialWithUserSavedTutorial = domainBuilder.buildTutorialWithUserSavedTutorial();
        const tutorialEvaluation = {
          id: 123,
          userId: tutorialWithUserSavedTutorial.userTutorial.userId,
          tutorialId: tutorialWithUserSavedTutorial.id,
        };
        tutorialEvaluationRepository = { find: sinon.spy(async () => [tutorialEvaluation]) };
        tutorialRepository = {
          findWithUserTutorialForCurrentUser: sinon.spy(async () => [tutorialWithUserSavedTutorial]),
        };

        // When
        const tutorials = await findSavedTutorials({
          tutorialEvaluationRepository,
          tutorialRepository,
          userId,
        });

        // Then
        const expectedTutorialWithUserTutorial = {
          ...tutorialWithUserSavedTutorial,
          tutorialEvaluation,
        };
        expect(tutorials).to.deep.equal([expectedTutorialWithUserTutorial]);
      });
    });
  });
});
