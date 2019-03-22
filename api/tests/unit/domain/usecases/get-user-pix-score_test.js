const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserPixScore = require('../../../../lib/domain/usecases/get-user-pix-score');

describe('Unit | UseCase | get-user-pix-score', () => {

  let smartPlacementKnowledgeElementRepository;

  beforeEach(() => {
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  context('Access management', () => {

    beforeEach(() => {
      smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([]);
    });

    it('should resolve when authenticated user is the same as asked', () => {
      // given
      const authenticatedUserId = 2;
      const requestedUserId = 2;

      // when
      const promise = getUserPixScore({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
      });

      // then
      return expect(promise).to.be.fulfilled;
    });

    it('should reject a "UserNotAuthorizedToAccessEntity" domain error when authenticated user is not the one asked', () => {
      // given
      const authenticatedUserId = 34;
      const requestedUserId = 2;

      // when
      const promise = getUserPixScore({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
      });

      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
    });
  });

  context('Output checking', () => {

    it('should return the user Pix score', async () => {
      // given
      const authenticatedUserId = 2;
      const requestedUserId = 2;
      const sumOfPixKnowledgeElement = 6;
      const pixScoreExpected = {
        pixScore: sumOfPixKnowledgeElement
      };

      const knowledgeElementList = [
        domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1, earnedPix: 1 }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 2, earnedPix: 2 }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 3, earnedPix: 3 }),
      ];
      smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

      // when
      const userPixScore = await getUserPixScore({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
      });

      //then
      expect(userPixScore).to.deep.equal(pixScoreExpected);
    });
  });
});
