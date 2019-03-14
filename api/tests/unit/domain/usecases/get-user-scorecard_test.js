const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserScorecard = require('../../../../lib/domain/usecases/get-user-scorecard');

describe('Unit | UseCase | get-user-scorecard', () => {

  let competenceRepository;
  let smartPlacementKnowledgeElementRepository;

  beforeEach(() => {
    competenceRepository = { list: sinon.stub() };
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  context('Access management', () => {

    beforeEach(() => {
      competenceRepository.list.resolves([]);
      smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([]);
    });

    it('should resolve when authenticated user is the same as asked', () => {
      // given
      const authenticatedUserId = 2;
      const requestedUserId = 2;

      // when
      const promise = getUserScorecard({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
        competenceRepository
      });

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should reject a "UserNotAuthorizedToAccessEntity" domain error when authenticated user is not the one asked', () => {
      // given
      const authenticatedUserId = 34;
      const requestedUserId = 2;

      // when
      const promise = getUserScorecard({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
        competenceRepository
      });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
    });
  });

  context('Output checking', () => {

    it('should return the user scorecard', async () => {
      // given
      const authenticatedUserId = 2;
      const requestedUserId = 2;

      const competenceList = [
        domainBuilder.buildCompetence({ id: 1, name: 'compétence 1' }),
        domainBuilder.buildCompetence({ id: 2, name: 'compétence 2' })
      ];
      competenceRepository.list.resolves(competenceList);

      const knowledgeElementList = [
        domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1 }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1 }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 2 })
      ];
      smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

      // when
      await getUserScorecard({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
        competenceRepository
      });

      //then
      //write a good test

    });
  });
});
