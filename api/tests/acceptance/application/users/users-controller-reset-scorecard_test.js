import _ from 'lodash';

import {
  knex,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  sinon,
  mockLearningContent,
  learningContentBuilder,
} from '../../../test-helper';

import createServer from '../../../../server';
import CampaignParticipationStatuses from '../../../../lib/domain/models/CampaignParticipationStatuses';

const { STARTED } = CampaignParticipationStatuses;

describe('Acceptance | Controller | users-controller-reset-scorecard', function () {
  let options;
  let server;

  let userId;
  const competenceId = 'recAbe382T0e1337';
  const competence = {
    id: competenceId,
    nameFr: 'Mener une recherche et une veille d’information',
    descriptionFr: 'descriptionCompetence1',
    index: '1.1',
    origin: 'Pix',
    areaId: 'recvoGdo7z2z7pXWa',
  };
  const area = {
    id: 'recvoGdo7z2z7pXWa',
    titleFr: 'Information et données',
    color: 'jaffa',
    code: '1',
    competenceIds: [competenceId],
  };

  function inspectCompetenceEvaluationInDb({ userId, competenceId }) {
    return knex.select('*').from('competence-evaluations').where({ userId, competenceId });
  }

  function inspectCampaignAssessmentsInDb({ userId, state }) {
    return knex.select('*').from('assessments').where({ userId, state });
  }

  function inspectKnowledgeElementsInDb({ userId, competenceId }) {
    return knex.select('*').from('knowledge-elements').where({ userId, competenceId }).orderBy('createdAt', 'DESC');
  }

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();

    options = {
      method: 'POST',
      url: `/api/users/${userId}/competences/${competenceId}/reset`,
      payload: {},
      headers: { 'accept-language': 'fr-fr' },
    };

    const learningContent = [
      {
        ...area,
        competences: [
          {
            ...competence,
            tubes: [
              {
                id: 'recTube1',
                skills: [
                  {
                    id: 'web1',
                  },
                  {
                    id: 'web2',
                  },
                  {
                    id: 'web3',
                  },
                  {
                    id: 'web4',
                  },
                ],
              },
              {
                id: 'recTube2',
                skills: [
                  {
                    id: 'url1',
                  },
                  {
                    id: 'url2',
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
    const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
    mockLearningContent(learningContentObjects);

    server = await createServer();
  });

  afterEach(async function () {
    await knex('knowledge-elements').delete();
    await knex('answers').delete();
    await knex('competence-evaluations').delete();
    await knex('assessments').delete();
    await knex('campaign-participations').delete();
  });

  describe('POST /users/{id}/competences/{id}/reset', function () {
    describe('Resource access management', function () {
      it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async function () {
        // given
        const otherUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('Precondition verification', function () {
      const competenceEvaluationId = 111;

      beforeEach(async function () {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        databaseBuilder.factory.buildCompetenceEvaluation({
          id: competenceEvaluationId,
          userId,
          competenceId,
        });

        databaseBuilder.factory.buildKnowledgeElement({
          id: 1,
          userId,
          competenceId,
          createdAt: new Date(),
        });

        await databaseBuilder.commit();
      });

      it('should respond with a 412 - precondition failed - if last knowledge element date is not old enough', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(412);
      });
    });

    describe('Success case', function () {
      let response;
      const otherStartedCompetenceId = 'recBejNZgJke422G';
      const createdAt = new Date('2019-01-01');

      beforeEach(async function () {
        options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

        sinon.useFakeTimers({
          now: new Date('2019-01-10'),
          toFake: ['Date'],
        });

        const campaign = databaseBuilder.factory.buildCampaign();
        databaseBuilder.factory.buildCampaignSkill({ campaignId: campaign.id, skillId: 'url1' });

        _.each(
          [
            {
              assessment: { userId },
              competenceEvaluation: { competenceId, userId, status: 'started' },
              knowledgeElements: [
                { skillId: 'web1', status: 'validated', source: 'direct', competenceId, earnedPix: 1, createdAt },
                { skillId: 'web2', status: 'invalidated', source: 'direct', competenceId, earnedPix: 2, createdAt },
                { skillId: 'web4', status: 'invalidated', source: 'inferred', competenceId, earnedPix: 4, createdAt },
                { skillId: 'url2', status: 'validated', source: 'direct', competenceId, earnedPix: 4, createdAt },
              ],
            },
            {
              assessment: { userId },
              competenceEvaluation: { competenceId: otherStartedCompetenceId, userId, status: 'started' },
              knowledgeElements: [
                {
                  skillId: 'rechInfo3',
                  status: 'validated',
                  source: 'direct',
                  competenceId: otherStartedCompetenceId,
                  earnedPix: 3,
                  createdAt,
                },
              ],
            },
            {
              assessment: { userId, type: 'CAMPAIGN' },
              campaignParticipation: { campaignId: campaign.id, status: STARTED },
              knowledgeElements: [
                { skillId: 'url1', status: 'validated', source: 'direct', competenceId, earnedPix: 2, createdAt },
              ],
            },
          ],
          ({ assessment, competenceEvaluation, knowledgeElements, campaignParticipation }) => {
            const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
              ...campaignParticipation,
            }).id;
            const assessmentId = databaseBuilder.factory.buildAssessment({ ...assessment, campaignParticipationId }).id;
            databaseBuilder.factory.buildCompetenceEvaluation({ ...competenceEvaluation, assessmentId });
            _.each(knowledgeElements, (ke) =>
              databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId, assessmentId })
            );
          }
        );

        await databaseBuilder.commit();
      });

      it('should return 200 and the updated scorecard', async function () {
        // given
        const expectedScorecardJSONApi = {
          data: {
            type: 'scorecards',
            id: `${userId}_${competenceId}`,
            attributes: {
              'competence-id': 'recAbe382T0e1337',
              description: 'descriptionCompetence1',
              'earned-pix': 0,
              'has-not-earned-anything': true,
              'has-not-reached-level-one': true,
              'has-reached-at-least-level-one': false,
              index: '1.1',
              'is-finished': false,
              'is-finished-with-max-level': false,
              'is-improvable': false,
              'is-max-level': false,
              'is-not-started': true,
              'is-progressable': false,
              'is-resettable': false,
              'is-started': false,
              level: 0,
              name: 'Mener une recherche et une veille d’information',
              'percentage-ahead-of-next-level': 0,
              'pix-score-ahead-of-next-level': 0,
              'remaining-days-before-improving': null,
              'remaining-days-before-reset': null,
              'remaining-pix-to-next-level': 8,
              'should-wait-before-improving': false,
              status: 'NOT_STARTED',
            },
            relationships: {
              area: {
                data: {
                  id: area.id,
                  type: 'areas',
                },
              },
              tutorials: {
                links: {
                  related: `/api/scorecards/${userId}_${competenceId}/tutorials`,
                },
              },
            },
          },
          included: [
            {
              attributes: {
                code: area.code,
                title: area.titleFr,
                color: area.color,
              },
              id: area.id,
              type: 'areas',
            },
          ],
        };

        // when
        response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result).to.deep.equal(expectedScorecardJSONApi);
      });

      it('should have reset the competence evaluation', async function () {
        // when
        response = await server.inject(options);

        // then
        const competenceEvaluation = await inspectCompetenceEvaluationInDb({ userId, competenceId });
        const otherCompetenceEvaluation = await inspectCompetenceEvaluationInDb({
          userId,
          competenceId: otherStartedCompetenceId,
        });
        expect(competenceEvaluation[0].status).to.equal('reset');
        expect(otherCompetenceEvaluation[0].status).to.equal('started');
      });

      it('should have reset the assessment of campaign participation', async function () {
        // given
        const state = 'aborted';

        // when
        response = await server.inject(options);

        // then
        const campaignAssessments = await inspectCampaignAssessmentsInDb({ userId, state });
        expect(campaignAssessments).to.have.lengthOf(1);
      });

      it('should have reset the knowledge elements created from both competence evaluations and campaign', async function () {
        // when
        response = await server.inject(options);

        // then
        const knowledgeElement = await inspectKnowledgeElementsInDb({ userId, competenceId });
        const knowledgeElementsOtherCompetence = await inspectKnowledgeElementsInDb({
          userId,
          competenceId: otherStartedCompetenceId,
        });

        expect(knowledgeElement).to.have.length(10);
        expect(knowledgeElement[0].earnedPix).to.equal(0);
        expect(knowledgeElement[0].status).to.equal('reset');
        expect(knowledgeElementsOtherCompetence[0].earnedPix).to.equal(3);
        expect(knowledgeElementsOtherCompetence[0].status).to.equal('validated');
      });
    });
  });
});
