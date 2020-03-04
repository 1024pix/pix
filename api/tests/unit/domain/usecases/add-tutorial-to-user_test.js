const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const addTutorialToUser = require('../../../../lib/domain/usecases/add-tutorial-to-user');
const AirtableNotFoundError = require('../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');

describe('Unit | UseCase | add-tutorial-to-user', () => {

  let tutorialRepository;
  let userTutorialRepository;
  let userId;

  beforeEach(function() {
    userTutorialRepository = { addTutorial: sinon.spy() };
    userId = 'userId';
  });

  context('when the tutorial exists', function() {
    it('should call the userTutorialRepository', async function() {
      // Given
      tutorialRepository = { get: domainBuilder.buildTutorial };
      const tutorialId = 'tutorialId';

      // When
      await addTutorialToUser({ tutorialRepository, userTutorialRepository, userId, tutorialId });

      // Then
      expect(userTutorialRepository.addTutorial).to.have.been.calledWith({ userId, tutorialId });
    });
  });

  context('when the tutorial doesnt exist', function() {
    it('should throw a Domain error', async function() {
      // Given
      tutorialRepository = {
        get: async () => {
          throw new AirtableNotFoundError();
        }
      };
      const tutorialId = 'nonExistentTutorialId';

      // When
      const result = await catchErr(addTutorialToUser)({
        tutorialRepository,
        userTutorialRepository,
        userId,
        tutorialId
      });

      // Then
      expect(userTutorialRepository.addTutorial).to.not.have.been.called;
      expect(result).to.be.instanceOf(AirtableNotFoundError);
    });
  });
});
