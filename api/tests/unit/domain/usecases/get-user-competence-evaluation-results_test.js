const { sinon, expect, domainBuilder } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const getUserCompetenceEvaluationResult = require('../../../../lib/domain/usecases/get-user-competence-evaluation-results');

function assertCompetenceEvaluationResult(userCompetenceEvaluationResult, expectedUserCompetenceEvaluationResult) {
  expect(userCompetenceEvaluationResult.earnedPix).to.equal(expectedUserCompetenceEvaluationResult.earnedPix);
  expect(userCompetenceEvaluationResult.level).to.equal(expectedUserCompetenceEvaluationResult.level);
  expect(userCompetenceEvaluationResult.pixScoreAheadOfNextLevel).to.equal(expectedUserCompetenceEvaluationResult.pixScoreAheadOfNextLevel);
}

describe('Unit | UseCase | get-user-competence-evaluation-results', () => {

  let competenceRepository;
  let smartPlacementKnowledgeElementRepository;

  beforeEach(() => {
    competenceRepository = { list: sinon.stub() };
    smartPlacementKnowledgeElementRepository = { findUniqByUserId: sinon.stub() };
  });

  afterEach(() => {
    sinon.restore();
  });

  context('When user is authenticated', () => {
    const authenticatedUserId = 2;
    const earnedPixDefaultValue = 4;
    const maxLevel = 5;

    context('And user asks for his own competence-evaluation-results', () => {
      const requestedUserId = 2;

      it('should resolve', () => {
        // given
        competenceRepository.list.resolves([]);
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([]);

        // when
        const promise = getUserCompetenceEvaluationResult({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should return related user competence-evaluation-results', async () => {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const levelForCompetenceId2 = 0;
        const pixScoreAheadOfNextLevelForCompetenceId2 = 4;

        const competenceList = [
          domainBuilder.buildCompetence({ id: 1 }),
          domainBuilder.buildCompetence({ id: 2 })
        ];
        competenceRepository.list.resolves(competenceList);

        const knowledgeElementList = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1 }),
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 2 })
        ];
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

        const expectedUserCompetenceEvaluationResult = [
          domainBuilder.buildUserCompetenceEvaluationResult({
            courseId: competenceList[0].courseId,
            name: competenceList[0].name,
            earnedPix: earnedPixForCompetenceId1,
            level: levelForCompetenceId1,
            pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1
          }),

          domainBuilder.buildUserCompetenceEvaluationResult({
            courseId: competenceList[1].courseId,
            name: competenceList[1].name,
            earnedPix: earnedPixDefaultValue,
            level: levelForCompetenceId2,
            pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId2
          }),
        ];

        // when
        const userCompetenceEvaluationResult = await getUserCompetenceEvaluationResult({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        //then
        assertCompetenceEvaluationResult(userCompetenceEvaluationResult[0], expectedUserCompetenceEvaluationResult[0]);
        assertCompetenceEvaluationResult(userCompetenceEvaluationResult[1], expectedUserCompetenceEvaluationResult[1]);
      });

      it('should return the user competence-evaluation-results with level limited to 5', async () => {
      // given
        const earnedPixNeededForLevelSixLimitedToFive = 50;
        const pixScoreAheadOfNextLevel = 2;

        const competenceList = [
          domainBuilder.buildCompetence({ id: 1 }),
        ];
        competenceRepository.list.resolves(competenceList);

        const knowledgeElementList = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ competenceId: 1, earnedPix: earnedPixNeededForLevelSixLimitedToFive })
        ];
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves(knowledgeElementList);

        const expectedUserCompetenceEvaluationResult = [
          domainBuilder.buildUserCompetenceEvaluationResult({
            courseId: competenceList[0].courseId,
            name: competenceList[0].name,
            earnedPix: earnedPixNeededForLevelSixLimitedToFive,
            level: maxLevel,
            pixScoreAheadOfNextLevel
          }),
        ];

        // when
        const userCompetenceEvaluationResult = await getUserCompetenceEvaluationResult({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        //then
        assertCompetenceEvaluationResult(userCompetenceEvaluationResult[0], expectedUserCompetenceEvaluationResult[0]);
      });
    });

    context('And user asks for competence-evaluation-results that do not belongs to him', () => {
      it('should reject a "UserNotAuthorizedToAccessEntity" domain error', () => {
        // given
        const requestedUserId = 34;

        competenceRepository.list.resolves([]);
        smartPlacementKnowledgeElementRepository.findUniqByUserId.resolves([]);

        // when
        const promise = getUserCompetenceEvaluationResult({
          authenticatedUserId,
          requestedUserId,
          smartPlacementKnowledgeElementRepository,
          competenceRepository
        });

        // then
        return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
      });
    });
  });
});
