const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findUserTutorials = require('../../../../lib/domain/usecases/find-user-tutorials');

describe('Unit | UseCase | find-user-tutorials', () => {

  let tutorialEvaluationRepository;
  let tutorialRepository;
  let userTutorialRepository;
  let tutorial;
  const userId = 'userId';
  const tutorialId = 'tutorialId';
  const userTutorialId = 'userTutorialId';

  beforeEach(() => {
    tutorial = domainBuilder.buildTutorial({ id: tutorialId });
  });

  afterEach(() => {
    sinon.restore();
  });

  context('when there is no tutorial saved by current user', () => {
    beforeEach(() => {
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      tutorialRepository = { findByRecordIds: sinon.spy(async () => []) };
      userTutorialRepository = { find: sinon.spy(async () => []) };
    });

    it('should call the userTutorialRepository', async function() {
      // When
      await findUserTutorials({ tutorialEvaluationRepository, tutorialRepository, userTutorialRepository, userId });

      // Then
      expect(userTutorialRepository.find).to.have.been.calledWith({ userId });
    });

    it('should return an empty array', async function() {
      // When
      const tutorials = await findUserTutorials({ tutorialEvaluationRepository, tutorialRepository, userTutorialRepository, userId });

      // Then
      expect(tutorials).to.deep.equal([]);
    });
  });

  context('when there is one tutorial saved by current user', () => {
    beforeEach(() => {
      const userTutorial = { id: userTutorialId, userId, tutorialId };
      tutorialEvaluationRepository = { find: sinon.spy(async () => []) };
      userTutorialRepository = { find: sinon.spy(async () => [userTutorial]) };
      tutorialRepository = { findByRecordIds: sinon.spy(async () => [tutorial]) };
    });

    it('should call the tutorialRepository', async function() {
      // When
      await findUserTutorials({ tutorialEvaluationRepository, tutorialRepository, userTutorialRepository, userId });

      // Then
      expect(tutorialRepository.findByRecordIds).to.have.been.calledWith([tutorialId]);
    });

    it('should return user-tutorials', async function() {
      // Given
      const expectedUserTutorials = [{
        id: userTutorialId,
        tutorial,
        tutorialId,
        userId,
      }];

      // When
      const tutorials = await findUserTutorials({ tutorialEvaluationRepository, tutorialRepository, userTutorialRepository, userId });

      // Then
      expect(tutorials).to.deep.equal(expectedUserTutorials);
    });
  });

});
