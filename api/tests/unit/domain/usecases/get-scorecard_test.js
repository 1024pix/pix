const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getScorecard = require('../../../../lib/domain/usecases/get-scorecard');

function assertScorecard(userScorecard, expectedUserScorecard) {
  expect(userScorecard.earnedPix).to.equal(expectedUserScorecard.earnedPix);
  expect(userScorecard.level).to.equal(expectedUserScorecard.level);
  expect(userScorecard.pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard.pixScoreAheadOfNextLevel);
}

describe('Unit | UseCase | get-scorecard', () => {

  let competenceRepository;
  let smartPlacementKnowledgeElementRepository;

  beforeEach(() => {
    competenceRepository = { get: sinon.stub() };
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  context('When user is authenticated', () => {
    const authenticatedUserId = 2;
    const maxLevel = 5;

    context('And user asks for his own scorecards', () => {
      const scorecardId = `${authenticatedUserId}_1`;

      it('should resolve', () => {
        // given
        competenceRepository.get.resolves([]);
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([]);

        // when
        const promise = getScorecard({
          authenticatedUserId,
          scorecardId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should return related user scorecards', async () => {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const competence = domainBuilder.buildCompetence({ id: 1 });

        competenceRepository.get.resolves(competence);

        const knowledgeElementList = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1 }),
        ];

        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          courseId: competence.courseId,
          name: competence.name,
          earnedPix: earnedPixForCompetenceId1,
          level: levelForCompetenceId1,
          pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1
        });

        // when
        const userScorecard = await getScorecard({
          authenticatedUserId,
          scorecardId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        //then
        assertScorecard(userScorecard, expectedUserScorecard);
      });

      it('should return the user scorecard with level limited to 5', async () => {
      // given
        const earnedPixNeededForLevelSixLimitedToFive = 50;
        const pixScoreAheadOfNextLevel = 2;

        const competence = domainBuilder.buildCompetence({ id: 1 });

        competenceRepository.get.resolves(competence);

        const knowledgeElementList = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1, earnedPix: earnedPixNeededForLevelSixLimitedToFive })
        ];

        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

        const expectedUserScorecard = domainBuilder.buildUserScorecard({
          courseId: competence.courseId,
          name: competence.name,
          earnedPix: earnedPixNeededForLevelSixLimitedToFive,
          level: maxLevel,
          pixScoreAheadOfNextLevel
        });

        // when
        const userScorecard = await getScorecard({
          authenticatedUserId,
          scorecardId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        //then
        assertScorecard(userScorecard, expectedUserScorecard);
      });
    });
  });
});
