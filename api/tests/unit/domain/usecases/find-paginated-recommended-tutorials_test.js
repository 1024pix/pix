const { sinon, expect, domainBuilder } = require('../../../test-helper');
const findRecommendedTutorials = require('../../../../lib/domain/usecases/find-paginated-recommended-tutorials');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

describe('Unit | UseCase | find-paginated-recommended-tutorials', function () {
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
      const page = {
        number: 1,
        size: 2,
      };
      const knowledgeElementRepository = {
        findInvalidatedAndDirectByUserId: sinon.stub().resolves([]),
      };

      const expectedPagination = {
        page: 1,
        pageSize: 2,
        rowCount: 0,
        pageCount: 0,
      };

      // When
      const tutorials = await findRecommendedTutorials({ userId, knowledgeElementRepository, page });

      // Then
      expect(tutorials.results).to.have.lengthOf(0);
      expect(tutorials.pagination).to.deep.equal(expectedPagination);
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
        findByRecordIds: sinon.stub().resolves([]),
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
      const page = {
        number: 1,
        size: 2,
      };

      skillRepository.findOperativeByIds.onFirstCall().resolves(skills);

      const expectedTutorials = [
        domainBuilder.buildTutorial({ id: 'tuto1' }),
        domainBuilder.buildTutorial({ id: 'tuto2' }),
        domainBuilder.buildTutorial({ id: 'tuto3' }),
        domainBuilder.buildTutorial({ id: 'tuto4' }),
      ];

      const expectedPagination = {
        page: 1,
        pageSize: 2,
        rowCount: 4,
        pageCount: 2,
      };

      const tutorialRepository = {
        findByRecordIds: sinon.stub(),
      };

      tutorialRepository.findByRecordIds.resolves(expectedTutorials);

      // When
      const tutorials = await findRecommendedTutorials({
        userId,
        knowledgeElementRepository,
        skillRepository,
        tutorialRepository,
        page,
      });

      //Then
      expect(tutorialRepository.findByRecordIds).to.have.been.calledWith(['tuto1', 'tuto2', 'tuto3', 'tuto4']);
      expect(tutorials.results).to.deep.equal([expectedTutorials[0], expectedTutorials[1]]);
      expect(tutorials.pagination).to.deep.equal(expectedPagination);
    });
  });
});
