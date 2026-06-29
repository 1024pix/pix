import _ from 'lodash';
import Sinon from 'sinon';

import { createServer } from '../../../../../server.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { FRENCH_SPOKEN } from '../../../../../src/shared/domain/services/locale-service.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { buildLearningContent } from '../../../../tooling/learning-content-builder/build-learning-content.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | scorecard-controller', function () {
  describe('Scorecard and tutorial routes', function () {
    let options;
    let server;
    const userId = 42;

    const competenceId = 'recCompetence';
    const skillWeb1Id = 'recAcquisWeb1';
    const skillWeb1Name = '@web1';
    const tutorialWebId = 'recTutorial1';

    const competence = {
      id: competenceId,
      name_i18n: {
        fr: 'Mener une recherche et une veille d’information',
      },
      description_i18n: {
        fr: 'Une description',
      },
      index: '1.1',
      origin: 'Pix',
      areaId: 'recvoGdo7z2z7pXWa',
    };

    const area = {
      id: 'recvoGdo7z2z7pXWa',
      title_i18n: {
        fr: 'Information et données',
      },
      color: 'jaffa',
      code: '1',
      competenceIds: [competenceId],
    };

    const learningContent = {
      areas: [area],
      competences: [competence],
      tubes: [
        {
          id: 'recArea1_Competence1_Tube1',
          name: '@web',
          practicalDescription_i18n: {
            fr: 'Ceci est une description pratique',
          },
          practicalTitle_i18n: {
            fr: 'Ceci est un titre pratique',
          },
          competenceId: competenceId,
        },
      ],
      skills: [
        {
          id: skillWeb1Id,
          name: skillWeb1Name,
          status: 'actif',
          competenceId: competenceId,
          tutorialIds: ['recTutorial0', tutorialWebId, 'recTutorial2'],
        },
      ],
      tutorials: [
        {
          id: 'recTutorial0',
          locale: 'en-us',
          duration: '00:00:54',
          format: 'video',
          link: 'https://tuto.com',
          source: 'tuto.com',
          title: 'tuto1',
        },
        {
          id: tutorialWebId,
          locale: 'fr-fr',
          duration: '00:03:31',
          format: 'vidéo',
          link: 'http://www.example.com/this-is-an-example.html',
          source: 'Source Example, Example',
          title: 'Communiquer',
        },
        {
          id: 'recTutorial2',
          locale: 'fr-fr',
          duration: '00:03:31',
          format: 'vidéo',
          link: 'http://www.example.com/this-is-an-example.html',
          source: 'Source Example, Example',
          title: 'Communiquer',
        },
      ],
    };

    beforeEach(async function () {
      server = await createServer();
      databaseBuilder.factory.buildUser({ id: userId });
      databaseBuilder.factory.learningContent.build(learningContent);
      await databaseBuilder.commit();
    });

    describe('GET /scorecards/{id}', function () {
      beforeEach(async function () {
        options = {
          method: 'GET',
          url: `/api/scorecards/${userId}_${competenceId}`,
          payload: {},
          headers: {},
        };
      });

      context('Resource access management', function () {
        it('should respond with a 401 - unauthorized access - if user is not authenticated', function () {
          // given
          options.headers.authorization = 'invalid.access.token';

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(401);
          });
        });
      });

      context('Success case', function () {
        beforeEach(async function () {
          options.headers = generateAuthenticatedUserRequestHeaders({ userId });

          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            competenceId: competenceId,
          });

          const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
          databaseBuilder.factory.buildCompetenceEvaluation({
            userId,
            assessmentId,
            competenceId: competenceId,
          });

          await databaseBuilder.commit();
        });

        it('should return 200', function () {
          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(200);
          });
        });

        it("should return user's serialized scorecards", function () {
          // when
          const promise = server.inject(options);

          const expectedScorecardJSONApi = {
            data: {
              type: 'scorecards',
              id: `${userId}_${competenceId}`,
              attributes: {
                'competence-id': 'recCompetence',
                description: 'Une description',
                'earned-pix': 2,
                'has-not-earned-anything': false,
                'has-not-reached-level-one': true,
                'has-reached-at-least-level-one': false,
                index: '1.1',
                'is-finished': false,
                'is-finished-with-max-level': false,
                'is-improvable': false,
                'is-max-level': false,
                'is-not-started': false,
                'is-progressable': true,
                'is-resettable': true,
                'is-started': true,
                level: 0,
                name: 'Mener une recherche et une veille d’information',
                'percentage-ahead-of-next-level': 25,
                'pix-score-ahead-of-next-level': 2,
                'remaining-days-before-improving': 0,
                'remaining-days-before-reset': 0,
                'remaining-pix-to-next-level': 6,
                'should-wait-before-improving': false,
                status: 'STARTED',
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
                  title: area.title_i18n.fr,
                  color: area.color,
                },
                id: area.id,
                type: 'areas',
              },
            ],
          };

          // then
          return promise.then((response) => {
            expect(response.result.data).to.deep.equal(expectedScorecardJSONApi.data);
            expect(response.result.included).to.deep.equal(expectedScorecardJSONApi.included);
          });
        });
      });
    });

    describe('GET /scorecards/{id}/tutorials', function () {
      beforeEach(async function () {
        options = {
          method: 'GET',
          url: `/api/scorecards/${userId}_${competenceId}/tutorials`,
          payload: {},
          headers: {},
        };
      });

      context('Resource access management', function () {
        it('should respond with a 401 - unauthorized access - if user is not authenticated', async function () {
          // given
          options.headers.authorization = 'invalid.access.token';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(401);
        });
      });

      context('Success case', function () {
        beforeEach(async function () {
          databaseBuilder.factory.buildUserSavedTutorial({ id: 10500, userId, tutorialId: tutorialWebId });
          await databaseBuilder.commit();

          options.headers = generateAuthenticatedUserRequestHeaders({ userId, acceptLanguage: FRENCH_SPOKEN });

          databaseBuilder.factory.buildKnowledgeElement({
            userId,
            competenceId: competence.id,
            status: KnowledgeElement.StatusType.INVALIDATED,
            skillId: skillWeb1Id,
            createdAt: new Date('2018-01-01'),
          });

          const assessmentId = databaseBuilder.factory.buildAssessment({ state: 'started' }).id;
          databaseBuilder.factory.buildCompetenceEvaluation({
            userId,
            assessmentId,
            competenceId: competence.id,
          });

          await databaseBuilder.commit();
        });

        it('should return 200', async function () {
          // given

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it("should return user's serialized tutorials", async function () {
          // given
          const expectedTutorialsJSONApi = {
            data: [
              {
                type: 'tutorials',
                id: 'recTutorial1',
                attributes: {
                  duration: '00:03:31',
                  format: 'vidéo',
                  link: 'http://www.example.com/this-is-an-example.html',
                  source: 'Source Example, Example',
                  title: 'Communiquer',
                  'tube-name': '@web',
                  'tube-practical-description': 'Ceci est une description pratique',
                  'tube-practical-title': 'Ceci est un titre pratique',
                  'skill-id': 'recAcquisWeb1',
                },
                relationships: {
                  'tutorial-evaluation': {
                    data: null,
                  },
                  'user-saved-tutorial': {
                    data: {
                      id: '10500',
                      type: 'user-saved-tutorial',
                    },
                  },
                },
              },
              {
                type: 'tutorials',
                id: 'recTutorial2',
                attributes: {
                  duration: '00:03:31',
                  format: 'vidéo',
                  link: 'http://www.example.com/this-is-an-example.html',
                  source: 'Source Example, Example',
                  title: 'Communiquer',
                  'tube-name': '@web',
                  'tube-practical-description': 'Ceci est une description pratique',
                  'tube-practical-title': 'Ceci est un titre pratique',
                  'skill-id': 'recAcquisWeb1',
                },
                relationships: {
                  'tutorial-evaluation': {
                    data: null,
                  },
                  'user-saved-tutorial': {
                    data: null,
                  },
                },
              },
            ],
            included: [
              {
                attributes: {
                  id: 10500,
                  'tutorial-id': 'recTutorial1',
                  'user-id': 42,
                },
                id: '10500',
                type: 'user-saved-tutorial',
              },
            ],
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.result.data).to.deep.equal(expectedTutorialsJSONApi.data);
          expect(response.result.included).to.deep.equal(expectedTutorialsJSONApi.included);
        });

        context('when user resets competence', function () {
          beforeEach(async function () {
            const options = {
              method: 'POST',
              url: `/api/users/${userId}/competences/${competenceId}/reset`,
              payload: {},
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
            };

            await server.inject(options);
          });

          it('should return an empty tutorial list', async function () {
            // given
            const expectedTutorialsJSONApi = {
              data: [],
            };

            // when
            const response = await server.inject(options);

            // then
            expect(response.result.data).to.deep.equal(expectedTutorialsJSONApi.data);
            expect(response.result.included).to.deep.equal(expectedTutorialsJSONApi.included);
          });
        });
      });
    });
  });

  describe('Scorecard reset route', function () {
    describe('POST /api/users/{id}/competences/{id}/reset', function () {
      let options;
      let server;

      let userId;
      const competenceId = 'recAbe382T0e1337';
      const competence = {
        id: competenceId,
        name_i18n: { fr: 'Mener une recherche et une veille d’information' },
        description_i18n: { fr: 'descriptionCompetence1' },
        index: '1.1',
        origin: 'Pix',
        areaId: 'recvoGdo7z2z7pXWa',
      };
      const area = {
        id: 'recvoGdo7z2z7pXWa',
        title_i18n: { fr: 'Information et données' },
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

        options = {
          method: 'POST',
          url: `/api/users/${userId}/competences/${competenceId}/reset`,
          payload: {},
          headers: {},
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
                    skills: [{ id: 'web1' }, { id: 'web2' }, { id: 'web3' }, { id: 'web4' }],
                  },
                  {
                    id: 'recTube2',
                    skills: [{ id: 'url1' }, { id: 'url2' }],
                  },
                ],
              },
            ],
          },
        ];
        const learningContentObjects = buildLearningContent.fromAreas(learningContent);
        databaseBuilder.factory.learningContent.build(learningContentObjects);
        await databaseBuilder.commit();

        server = await createServer();
      });

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
          options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      describe('Precondition verification', function () {
        const competenceEvaluationId = 111;

        beforeEach(async function () {
          options.headers = generateAuthenticatedUserRequestHeaders({ userId });

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
          options.headers = generateAuthenticatedUserRequestHeaders({ userId });

          Sinon.useFakeTimers({
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
                campaignParticipation: { campaignId: campaign.id, status: 'STARTED' },
                knowledgeElements: [
                  { skillId: 'url1', status: 'validated', source: 'direct', competenceId, earnedPix: 2, createdAt },
                ],
              },
            ],
            ({ assessment, competenceEvaluation, knowledgeElements, campaignParticipation }) => {
              const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
                ...campaignParticipation,
              }).id;
              const assessmentId = databaseBuilder.factory.buildAssessment({
                ...assessment,
                campaignParticipationId,
              }).id;
              databaseBuilder.factory.buildCompetenceEvaluation({ ...competenceEvaluation, assessmentId });
              _.each(knowledgeElements, (ke) =>
                databaseBuilder.factory.buildKnowledgeElement({ ...ke, userId, assessmentId }),
              );
            },
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
                  title: area.title_i18n.fr,
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

          expect(knowledgeElement).to.have.lengthOf(10);
          expect(knowledgeElement[0].earnedPix).to.equal(0);
          expect(knowledgeElement[0].status).to.equal('reset');
          expect(knowledgeElementsOtherCompetence[0].earnedPix).to.equal(3);
          expect(knowledgeElementsOtherCompetence[0].status).to.equal('validated');
        });
      });
    });
  });
});
