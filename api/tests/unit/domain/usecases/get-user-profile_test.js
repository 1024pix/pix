import { sinon, expect, domainBuilder } from '../../../test-helper.js';
import { Scorecard } from '../../../../lib/domain/models/Scorecard.js';
import { getUserProfile } from '../../../../lib/domain/usecases/get-user-profile.js';
import { constants } from '../../../../lib/domain/constants.js';
import _ from 'lodash';

function assertScorecard(userScorecard, expectedUserScorecard) {
  expect(userScorecard.earnedPix).to.equal(expectedUserScorecard.earnedPix);
  expect(userScorecard.level).to.equal(expectedUserScorecard.level);
  expect(userScorecard.pixScoreAheadOfNextLevel).to.equal(expectedUserScorecard.pixScoreAheadOfNextLevel);
  expect(userScorecard.status).to.equal(expectedUserScorecard.status);
}

describe('Unit | UseCase | get-user-profile', function () {
  let skillRepository;
  let areaRepository;
  let knowledgeElementRepository;
  let competenceRepository;
  const scorecard = { id: 'foo' };
  const locale = 'fr';

  beforeEach(function () {
    skillRepository = { list: sinon.stub() };
    areaRepository = { list: sinon.stub() };
    knowledgeElementRepository = { findUniqByUserIdGroupedByCompetenceId: sinon.stub() };
    competenceRepository = { listPixCompetencesOnly: sinon.stub() };
    sinon.stub(Scorecard, 'buildFrom').returns(scorecard);
  });

  context('When user is authenticated', function () {
    const userId = 2;
    const earnedPixDefaultValue = 4;

    context('And user asks for his own scorecards', function () {
      it('should return related user scorecards and pix score', async function () {
        // given
        const earnedPixForCompetenceId1 = 8;
        const levelForCompetenceId1 = 1;
        const pixScoreAheadOfNextLevelForCompetenceId1 = 0;

        const levelForCompetenceId2 = 0;
        const pixScoreAheadOfNextLevelForCompetenceId2 = 4;
        const competenceList = [
          domainBuilder.buildCompetence({ id: 1, areaId: 'area' }),
          domainBuilder.buildCompetence({ id: 2, areaId: 'area' }),
          domainBuilder.buildCompetence({ id: 3, areaId: 'area' }),
        ];
        const skills = [
          domainBuilder.buildSkill({ competenceId: competenceList[0].id }),
          domainBuilder.buildSkill({ competenceId: competenceList[1].id }),
          domainBuilder.buildSkill({ competenceId: competenceList[2].id }),
        ];
        const area = domainBuilder.buildArea({ id: 'area' });
        competenceRepository.listPixCompetencesOnly.resolves(competenceList);
        skillRepository.list.resolves(skills);
        areaRepository.list.resolves([area]);

        const assessmentFinishedOfCompetence1 = domainBuilder.buildAssessment({
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
        });

        const assessmentStartedOfCompetence2 = domainBuilder.buildAssessment({
          type: 'CAMPAIGN',
          state: 'started',
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
          1: [knowledgeElementList[0], knowledgeElementList[1]],
          2: [knowledgeElementList[2]],
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

        knowledgeElementRepository.findUniqByUserIdGroupedByCompetenceId.resolves(
          knowledgeElementGroupedByCompetenceId,
        );

        Scorecard.buildFrom
          .withArgs({
            userId,
            knowledgeElements: knowledgeElementGroupedByCompetenceId[1],
            competence: competenceList[0],
            skills: [skills[0]],
            area,
          })
          .returns(expectedUserScorecard[0]);

        Scorecard.buildFrom
          .withArgs({
            userId,
            knowledgeElements: knowledgeElementGroupedByCompetenceId[2],
            competence: competenceList[1],
            skills: [skills[1]],
            area,
          })
          .returns(expectedUserScorecard[1]);

        Scorecard.buildFrom
          .withArgs({
            userId,
            knowledgeElements: undefined,
            competence: competenceList[2],
            skills: [skills[2]],
            area,
          })
          .returns(expectedUserScorecard[2]);

        const expectedMaxReachableLevel = Symbol('maxReachableLevel');
        const expectedMaxReachablePixScore = Symbol('maxReachablePixCount');
        sinon.stub(constants, 'MAX_REACHABLE_LEVEL').value(expectedMaxReachableLevel);
        sinon.stub(constants, 'MAX_REACHABLE_PIX_SCORE').value(expectedMaxReachablePixScore);

        const expectedPixScore = _.sumBy(expectedUserScorecard, 'earnedPix');

        // when
        const userProfile = await getUserProfile({
          userId,
          knowledgeElementRepository,
          competenceRepository,
          areaRepository,
          skillRepository,
          locale,
        });

        //then
        expect(userProfile.pixScore).to.equal(expectedPixScore);
        expect(userProfile.maxReachableLevel).to.equal(expectedMaxReachableLevel);
        expect(userProfile.maxReachablePixScore).to.equal(expectedMaxReachablePixScore);
        assertScorecard(userProfile.scorecards[0], expectedUserScorecard[0]);
        assertScorecard(userProfile.scorecards[1], expectedUserScorecard[1]);
        assertScorecard(userProfile.scorecards[2], expectedUserScorecard[2]);
      });
    });
  });
});
