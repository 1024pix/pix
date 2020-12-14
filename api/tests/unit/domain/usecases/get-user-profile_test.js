const { sinon, expect, domainBuilder } = require('../../../test-helper');
const Scorecard = require('../../../../lib/domain/models/Scorecard');
const getUserProfile = require('../../../../lib/domain/usecases/get-user-profile');
const _ = require('lodash');

function assertScorecard(userScorecard, expectedUserScorecard) {
  expect(userScorecard.earnedPix).to.equal(expectedUserScorecard.earnedPix);
  expect(userScorecard.level).to.equal(expectedUserScorecard.level);
  expect(userScorecard.pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard.pixScoreAheadOfNextLevel);
  expect(userScorecard.status).to.equal(expectedUserScorecard.status);
}

describe('Unit | UseCase | get-user-profile', () => {

  let competenceRepository;
  let knowledgeElementRepository;
  let competenceEvaluationRepository;
  const scorecard = { id: 'foo' };
  const locale = 'fr';

  beforeEach(() => {
    competenceRepository = { listPixCompetencesOnly: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserIdGroupedByCompetenceId: sinon.stub() };
    competenceEvaluationRepository = { findByUserId: sinon.stub() };
    sinon.stub(Scorecard, 'buildFrom').returns(scorecard);
  });

  afterEach(() => {
    sinon.restore();
  });

  context('When user is authenticated', () => {
    const userId = 2;
    const earnedPixDefaultValue = 4;

    context('And user asks for his own scorecards', () => {

      it('should resolve', () => {
        // given
        competenceRepository.listPixCompetencesOnly.withArgs({ locale: 'fr' }).resolves([]);
        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.resolves({});
        competenceEvaluationRepository.findByUserId.resolves([]);

        // when
        const promise = getUserProfile({
          userId,
          knowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository,
        });

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should return related user scorecards and pix score', async () => {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const levelForCompetenceId2 = 0;
        const pixScoreAheadOfNextLevelForCompetenceId2 = 4;
        const competenceList = [
          domainBuilder.buildCompetence({ id: 1 }),
          domainBuilder.buildCompetence({ id: 2 }),
          domainBuilder.buildCompetence({ id: 3 }),
        ];
        competenceRepository.listPixCompetencesOnly.resolves(competenceList);

        const assessmentFinishedOfCompetence1 = domainBuilder.buildAssessment({
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
        });

        const assessmentStartedOfCompetence2 = domainBuilder.buildAssessment({
          type: 'CAMPAIGN',
          state: 'started',
        });
        const competenceEvaluationOfCompetence1 = domainBuilder.buildCompetenceEvaluation({
          competenceId: 1,
          assessment: assessmentFinishedOfCompetence1,
        });

        const knowledgeElementList = [
          domainBuilder.buildKnowledgeElement({
            competenceId: 1,
            assessment: assessmentFinishedOfCompetence1,
          }),
          domainBuilder.buildKnowledgeElement({
            competenceId: 1,
            assessment: assessmentFinishedOfCompetence1,
          }),
          domainBuilder.buildKnowledgeElement({
            competenceId: 2,
            assessment: assessmentStartedOfCompetence2,
          }),
        ];

        const knowledgeElementGroupedByCompetenceId = {
          '1': [ knowledgeElementList[0], knowledgeElementList[1] ],
          '2': [ knowledgeElementList[2] ],
        };

        const expectedUserScorecard = [
          domainBuilder.buildUserScorecard({
            name: competenceList[0].name,
            earnedPix: earnedPixForCompetenceId1,
            level: levelForCompetenceId1,
            pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId1,
            status: 'COMPLETED',
          }),

          domainBuilder.buildUserScorecard({
            name: competenceList[1].name,
            earnedPix: earnedPixDefaultValue,
            level: levelForCompetenceId2,
            pixScoreAheadOfNextLevel: pixScoreAheadOfNextLevelForCompetenceId2,
            status: 'STARTED',
          }),
          domainBuilder.buildUserScorecard({
            name: competenceList[2].name,
            earnedPix: 0,
            level: 0,
            pixScoreAheadOfNextLevel: 0,
            status: 'NOT_STARTED',
          }),
        ];

        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.resolves(knowledgeElementGroupedByCompetenceId);
        competenceEvaluationRepository.findByUserId.resolves([competenceEvaluationOfCompetence1]);

        Scorecard.buildFrom.withArgs({
          userId,
          knowledgeElements: knowledgeElementGroupedByCompetenceId[1],
          competence: competenceList[0],
          competenceEvaluation: competenceEvaluationOfCompetence1,
        }).returns(expectedUserScorecard[0]);

        Scorecard.buildFrom.withArgs({
          userId,
          knowledgeElements: knowledgeElementGroupedByCompetenceId[2],
          competence: competenceList[1],
          competenceEvaluation: undefined,
        }).returns(expectedUserScorecard[1]);

        Scorecard.buildFrom.withArgs({
          userId,
          knowledgeElements: undefined,
          competence: competenceList[2],
          competenceEvaluation: undefined,
        }).returns(expectedUserScorecard[2]);

        const expectedPixScore = _.sumBy(expectedUserScorecard, 'earnedPix');

        // when
        const userProfile = await getUserProfile({
          userId,
          knowledgeElementRepository,
          competenceRepository,
          competenceEvaluationRepository,
          locale,
        });

        //then
        expect(userProfile.pixScore).to.equal(expectedPixScore);
        assertScorecard(userProfile.scorecards[0], expectedUserScorecard[0]);
        assertScorecard(userProfile.scorecards[1], expectedUserScorecard[1]);
        assertScorecard(userProfile.scorecards[2], expectedUserScorecard[2]);
      });
    });
  });
});
