import sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import {
  generateAuthenticatedUserRequestHeaders,
  generateInjectOptions,
} from '../../../../tooling/test-utils/http-server.js';

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
                challenges: [{ id: firstChallengeId, langues: ['Franco Français'] }],
              },
              {
                id: skillWeb3Id,
                nom: '@web3',
                challenges: [{ id: secondChallengeId, langues: ['Franco Français'] }],
              },
              {
                id: skillWeb1Id,
                nom: '@web1',
                challenges: [
                  { id: thirdChallengeId, langues: ['Franco Français'] },
                  { id: otherChallengeId, langues: ['Franco Français'] },
                  { id: 'germanATChallengeId', statut: 'archivé', langues: ['Germano Autrichien'] },
                  { id: 'germanChallengeId_web1', langues: ['Allemand'] },
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
    databaseBuilder.factory.learningContent.build(learningContentObjects);
    await databaseBuilder.commit();
  });

  describe('GET /api/assessments/:assessment_id', function () {
    const assessmentId = 1;
    const userId = 1234;

    context('When there still are challenges to answer', function () {
      let clock;

      beforeEach(async function () {
        databaseBuilder.factory.buildUser({ id: userId });
        const campaign = databaseBuilder.factory.buildCampaign({ assessmentMethod: 'SMART_RANDOM' });
        const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
          userId,
          campaignId: campaign.id,
        });

        databaseBuilder.factory.buildCampaignSkill({
          campaignId: campaign.id,
          skillId: skillWeb1Id,
        });

        databaseBuilder.factory.buildAssessment({
          id: assessmentId,
          type: Assessment.types.CAMPAIGN,
          userId,
          campaignParticipationId: campaignParticipation.id,
          lastQuestionDate: new Date('2020-01-20'),
          state: 'started',
        });
        await databaseBuilder.commit();

        clock = sinon.useFakeTimers({
          now: Date.now(),
          toFake: ['Date'],
        });
      });

      afterEach(async function () {
        clock.restore();
      });

      it('should return an assessment', async function () {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}`,
          headers: generateAuthenticatedUserRequestHeaders({ userId }),
        };

        const lastQuestionDate = new Date();

        // when
        const response = await server.inject(options);

        // then
        const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionDate');
        expect(assessmentsInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
        expect(response.result.data.id).to.equal(assessmentId.toString());
        expect(response.result.data.relationships['next-challenge'].data.id).to.be.oneOf([
          thirdChallengeId,
          otherChallengeId,
        ]);
      });

      context('When user locale is de-AT', function () {
        it('should return german validated challenge', async function () {
          // given
          const options = generateInjectOptions({
            url: `/api/assessments/${assessmentId}`,
            method: 'GET',
            locale: 'de-AT',
            audience: ' https://app.pix.org',
            authorizationData: { userId: userId },
            // headers: generateAuthenticatedUserRequestHeaders({ userId }),
          });

          const lastQuestionDate = new Date();

          // when
          const response = await server.inject(options);

          // then

          const assessmentsInDb = await knex('assessments').where('id', assessmentId).first('lastQuestionDate');
          expect(assessmentsInDb.lastQuestionDate).to.deep.equal(lastQuestionDate);
          expect(response.result.data.id).to.equal(assessmentId.toString());
          expect(response.result.data.relationships['next-challenge'].data.id).to.be.equal('germanChallengeId_web1');
        });
      });
    });
  });
});
