const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findRecommendedTutorials = require('../../../../lib/domain/usecases/find-recommended-tutorials');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | UseCase | find-recommended-tutorials', function () {
  it('should find all KE related to a user', async function () {
    // Given
    const userId = 1;
    const knowledgeElementRepository = {
      findInvalidatedAndDirectByUserId: sinon.stub().resolves([]),
    };

    // When
    await findRecommendedTutorials({ userId, knowledgeElementRepository });

    // Then
    expect(knowledgeElementRepository.findInvalidatedAndDirectByUserId).to.have.been.calledWith(userId);
  });

  describe('when there are no invalidated and direct KE', function () {
    it('should return an empty array', async function () {
      // Given
      const userId = 1;
      const knowledgeElementRepository = {
        findInvalidatedAndDirectByUserId: sinon.stub().resolves([]),
      };

      // When
      const tutorials = await findRecommendedTutorials({ userId, knowledgeElementRepository });

      // Then
      expect(tutorials).to.have.lengthOf(0);
    });
  });

  describe('when there are invalidated and direct KE', function () {
    it('should find associated skills', async function () {
      // Given
      const userId = 1;
      const invalidatedKnowledgeElements = [
        domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'skill1',
        }),
        domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'skill2',
        }),
      ];

      const knowledgeElementRepository = {
        findInvalidatedAndDirectByUserId: sinon.stub().resolves(invalidatedKnowledgeElements),
      };

      const skillRepository = {
        findOperativeByIds: sinon.stub().resolves([]),
      };

      const tutorialRepository = {
        findByRecordIds: sinon.stub(),
      };

      // When
      await findRecommendedTutorials({ userId, knowledgeElementRepository, skillRepository, tutorialRepository });

      // Then
      expect(skillRepository.findOperativeByIds.firstCall).to.have.been.calledWith(['skill1', 'skill2']);
    });

    it('should return associated tutorials', async function () {
      // Given
      const userId = 1;
      const invalidatedKnowledgeElements = [
        domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'skill1',
        }),
        domainBuilder.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          source: KnowledgeElement.SourceType.DIRECT,
          skillId: 'skill2',
        }),
      ];
      const knowledgeElementRepository = {
        findInvalidatedAndDirectByUserId: sinon.stub().resolves(invalidatedKnowledgeElements),
      };
      const skills = [
        domainBuilder.buildSkill({ id: 'skill1', tutorialIds: ['tuto1', 'tuto2'] }),
        domainBuilder.buildSkill({ id: 'skill2', tutorialIds: ['tuto3', 'tuto4'] }),
      ];
      const skillRepository = {
        findOperativeByIds: sinon.stub(),
      };

      skillRepository.findOperativeByIds.onFirstCall().resolves(skills);

      const expectedTutorials = [
        domainBuilder.buildTutorial({ id: 'tuto1' }),
        domainBuilder.buildTutorial({ id: 'tuto2' }),
        domainBuilder.buildTutorial({ id: 'tuto3' }),
        domainBuilder.buildTutorial({ id: 'tuto4' }),
      ];

      const tutorialRepository = {
        findByRecordIds: sinon.stub(),
      };

      tutorialRepository.findByRecordIds.onFirstCall().resolves([expectedTutorials[0], expectedTutorials[1]]);
      tutorialRepository.findByRecordIds.onSecondCall().resolves([expectedTutorials[2], expectedTutorials[3]]);

      // When
      const tutorials = await findRecommendedTutorials({
        userId,
        knowledgeElementRepository,
        skillRepository,
        tutorialRepository,
      });

      //Then
      expect(tutorialRepository.findByRecordIds.firstCall).to.have.been.calledWith(['tuto1', 'tuto2']);
      expect(tutorialRepository.findByRecordIds.secondCall).to.have.been.calledWith(['tuto3', 'tuto4']);
      expect(tutorials).to.deep.equal(expectedTutorials);
    });
  });
});
