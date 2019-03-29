const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserScorecard = require('../../../../lib/domain/usecases/get-user-scorecards');

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

    it('should return related user scorecards', async () => {
      // given
      const authenticatedUserId = 2;
      const requestedUserId = 2;
      const earnedPixDefaultValue = 4;

      const earnedPixForCompetenceId1 = 8;
      const levelForCompetenceId1 = 1;
      const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

      const levelForCompetenceId2 = 0;
      const pixScoreAheadOfNextLevelForCompetenceId2 = 4;

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

      const expectedUserScorecard = [
        domainBuilder.buildUserScorecard({
          id: competenceList[0].id,
          name: competenceList[0].name,
          earnedPix: earnedPixForCompetenceId1,
          level: levelForCompetenceId1,
          pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1
        }),

        domainBuilder.buildUserScorecard({
          id: competenceList[1].id,
          name: competenceList[1].name,
          earnedPix: earnedPixDefaultValue,
          level: levelForCompetenceId2,
          pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId2
        }),
      ];

      // when
      const userScorecard = await getUserScorecard({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
        competenceRepository
      });

      //then
      expect(userScorecard[0].id).to.equal(expectedUserScorecard[0].id);
      expect(userScorecard[0].name).to.equal(expectedUserScorecard[0].name);
      expect(userScorecard[0].earnedPix).to.equal(expectedUserScorecard[0].earnedPix);
      expect(userScorecard[0].level).to.equal(expectedUserScorecard[0].level);
      expect(userScorecard[0].pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard[0].pixScoreAheadOfNextLevel);

      expect(userScorecard[1].id).to.equal(expectedUserScorecard[1].id);
      expect(userScorecard[1].name).to.equal(expectedUserScorecard[1].name);
      expect(userScorecard[1].earnedPix).to.equal(expectedUserScorecard[1].earnedPix);
      expect(userScorecard[1].level).to.equal(expectedUserScorecard[1].level);
      expect(userScorecard[1].pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard[1].pixScoreAheadOfNextLevel);

    });

    it('should return the user scorecard with level limited to 5', async () => {
      // given
      const authenticatedUserId = 2;
      const requestedUserId = 2;
      const earnedPixNeededForLevelSixLimitedToFive = 50;
      const maxLevel = 5;
      const pixScoreAheadOfNextLevel = 2;

      const competenceList = [
        domainBuilder.buildCompetence({ id: 1, name: 'compétence 1' }),
      ];
      competenceRepository.list.resolves(competenceList);

      const knowledgeElementList = [
        domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1, earnedPix: earnedPixNeededForLevelSixLimitedToFive })
      ];
      smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

      const expectedUserScorecard = [
        domainBuilder.buildUserScorecard({
          id: competenceList[0].id,
          name: competenceList[0].name,
          earnedPix: earnedPixNeededForLevelSixLimitedToFive,
          level: maxLevel,
          pixScoreAheadOfNextLevel
        }),
      ];

      // when
      const userScorecard = await getUserScorecard({
        authenticatedUserId,
        requestedUserId,
        smartPlacementKnowledgeElementRepository,
        competenceRepository
      });

      //then
      expect(userScorecard[0].id).to.equal(expectedUserScorecard[0].id);
      expect(userScorecard[0].name).to.equal(expectedUserScorecard[0].name);
      expect(userScorecard[0].earnedPix).to.equal(expectedUserScorecard[0].earnedPix);
      expect(userScorecard[0].level).to.equal(expectedUserScorecard[0].level);
      expect(userScorecard[0].pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard[0].pixScoreAheadOfNextLevel);
    });
  });
});
