import {
  expect,
  databaseBuilder,
  generateValidRequestAuthorizationHeader,
  mockLearningContent,
  learningContentBuilder,
  knex,
  sinon,
} from '../../../../test-helper.js';

import { createServer } from '../../../../../server.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';

const competenceId = 'recCompetence';
const skillWeb1Id = 'recAcquisWeb1';
const skillWeb2Id = 'recAcquisWeb2';
const skillWeb3Id = 'recAcquisWeb3';

const firstChallengeId = 'recFirstChallenge';
const secondChallengeId = 'recSecondChallenge';
const thirdChallengeId = 'recThirdChallenge';
const otherChallengeId = 'recOtherChallenge';

const learningContent = [
  {
    id: 'recArea1',
    title_i18n: {
      fr: 'area1_Title',
    },
    color: 'someColor',
    competences: [
      {
        id: competenceId,
        name_i18n: {
          fr: 'Mener une recherche et une veille d’information',
        },
        index: '1.1',
        tubes: [
          {
            id: 'recTube0_0',
            skills: [
              {
                id: skillWeb2Id,
                nom: '@web2',
                challenges: [{ id: firstChallengeId, alpha: 2.8, delta: 1.1, langues: ['Franco Français'] }],
              },
              {
                id: skillWeb3Id,
                nom: '@web3',
                challenges: [{ id: secondChallengeId, langues: ['Franco Français'], alpha: -1.2, delta: 3.3 }],
              },
              {
                id: skillWeb1Id,
                nom: '@web1',
                challenges: [
                  { id: thirdChallengeId, alpha: -0.2, delta: 2.7, langues: ['Franco Français'] },
                  { id: otherChallengeId, alpha: -0.2, delta: -0.4, langues: ['Franco Français'] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

describe('Acceptance | API | assessment-controller-get-next-challenge-for-campaign-assessment', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
    const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);
  });

  describe('GET /api/assessments/:assessment_id/next', function () {
    const assessmentId = 1;
    const userId = 1234;

    context('When there is still challenges to answer', function () {
      let clock;

      beforeEach(async function () {
        databaseBuilder.factory.buildUser({ id: userId });
        const campaign = databaseBuilder.factory.buildCampaign({ assessmentMethod: 'FLASH' });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
        });
        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: Assessment.types.CAMPAIGN,
          userId,
          campaignParticipationId: campaignParticipation.id,
          lastQuestionDate: new Date('2020-01-20'),
          state: 'started',
          method: 'FLASH',
        });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        await databaseBuilder.commit();

        clock = sinon.useFakeTimers({
          now: Date.now(),
          toFake: ['Date'],
        });
      });

      afterEach(async function () {
        clock.restore();
      });

      it('should return a challenge', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };

        const lastQuestionDate = new Date();

        // when
        const response = await server.inject(options);

        // then
        const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionDate');
        expect(assessmentsInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
        expect(response.result.data.id).to.be.oneOf([
          firstChallengeId,
          secondChallengeId,
          thirdChallengeId,
          otherChallengeId,
        ]);
      });
    });
  });
});
