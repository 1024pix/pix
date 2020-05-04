const { sinon, expect, domainBuilder, catchErr } = require('../../../test-helper');
const addTutorialEvaluation = require('../../../../lib/domain/usecases/add-tutorial-evaluation');
const AirtableNotFoundError = require('../../../../lib/infrastructure/datasources/airtable/AirtableResourceNotFound');

describe('Unit | UseCase | add-tutorial-evaluation', () => {

  let tutorialRepository;
  let tutorialEvaluationRepository;
  let userId;

  beforeEach(function() {
    tutorialEvaluationRepository = { addEvaluation: sinon.spy() };
    userId = 'userId';
  });

  context('when the tutorial exists', function() {
    it('should call the userTutorialRepository', async function() {
      // Given
      tutorialRepository = {
        get: domainBuilder.buildTutorial
      };
      const tutorialId = 'tutorialId';

      // When
      await addTutorialEvaluation({
        tutorialRepository,
        tutorialEvaluationRepository,
        userId,
        tutorialId
      });

      // Then
      expect(tutorialEvaluationRepository.addEvaluation).to.have.been.calledWith({ userId, tutorialId });
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
      const result = await catchErr(addTutorialEvaluation)({
        tutorialRepository,
        tutorialEvaluationRepository,
        userId,
        tutorialId
      });

      // Then
      expect(tutorialEvaluationRepository.addEvaluation).to.not.have.been.called;
      expect(result).to.be.instanceOf(AirtableNotFoundError);
    });
  });
});
