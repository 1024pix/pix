import { MAX_REACHABLE_LEVEL, PIX_COUNT_BY_LEVEL } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../tooling/learning-content-builder/index.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

/** Un acquis par niveau, chacun valant un niveau entier : les gravir tous atteint le plafond. */
const buildMaxLevelSkills = () =>
  Array.from({ length: MAX_REACHABLE_LEVEL }, (_, index) => ({
    id: `recSkill${index + 1}`,
    name: `@tube${index + 1}`,
    level: index + 1,
    pixValue: PIX_COUNT_BY_LEVEL,
  }));

describe('Acceptance | API | Competence Evaluations', function () {
  let server;
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
    server = await getServer();
  });

  describe('POST /api/competence-evaluations/start-or-resume', function () {
    const competenceId = 'recABCD123';

    context('When user is authenticated', function () {
      beforeEach(async function () {
        const learningContent = [
          {
            id: 'recArea1',
            competences: [
              {
                id: competenceId,
                tubes: [],
              },
            ],
          },
        ];

        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        databaseBuilder.factory.learningContent.build(learningContentObjects);
        await databaseBuilder.commit();
      });

      context('and competence exists', function () {
        it('should return 201 and the competence evaluation when it has been successfully created', async function () {
          // when
          const options = {
            method: 'POST',
            url: '/api/competence-evaluations/start-or-resume',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload: { competenceId },
          };
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['assessment-id']).to.be.not.null;
        });

        it('should return 200 and the competence evaluation when it has been successfully found', async function () {
          // given
          const options = {
            method: 'POST',
            url: '/api/competence-evaluations/start-or-resume',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload: { competenceId },
          };
          databaseBuilder.factory.buildCompetenceEvaluation({ competenceId, userId });
          await databaseBuilder.commit();

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['assessment-id']).to.be.not.null;
        });
      });

      context('and competence does not exists', function () {
        it('should return 404 error', async function () {
          // given
          const options = {
            method: 'POST',
            url: '/api/competence-evaluations/start-or-resume',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload: { competenceId: 'WRONG_ID' },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    context('When user is not authenticated', function () {
      it('should return 401 error', async function () {
        // given
        const options = {
          method: 'POST',
          url: '/api/competence-evaluations/start-or-resume',
          headers: {
            authorization: null,
          },
          payload: { competenceId },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('PUT /api/competence-evaluations/improve', function () {
    const competenceId = 'recABCD123';

    context('When user is authenticated', function () {
      context('and competence exists', function () {
        let response, assessment;

        beforeEach(async function () {
          databaseBuilder.factory.buildCompetenceEvaluation({ competenceId, userId });
          await databaseBuilder.commit();
        });

        context('and user has not reached maximum level of given competence', function () {
          beforeEach(async function () {
            // given
            const options = {
              method: 'PUT',
              url: '/api/competence-evaluations/improve',
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
              payload: { competenceId },
            };

            await databaseBuilder.commit();

            // when
            response = await server.inject(options);
            assessment = response.result.data.relationships.assessment.data;
          });

          it('should return 200 and the competence evaluation', async function () {
            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result.data.id).to.exist;
            expect(assessment.id).to.be.not.null;
            expect(assessment).to.exist;
          });

          it('should create an improving assessment', async function () {
            // then
            const [createdAssessment] = await knex('assessments').select().where({ id: assessment.id });
            expect(createdAssessment.isImproving).to.equal(true);
          });
        });

        context('and user has reached maximum level of given competence', function () {
          it('should return 403 error', async function () {
            // given
            // Le niveau se déduit des acquis validés : on décrit une compétence
            // dont un seul tube porte tout le score, et un utilisateur qui l'a
            // gravi jusqu'en haut.
            const learningContentObjects = learningContentBuilder.fromAreas([
              {
                id: 'recArea1',
                competences: [
                  {
                    id: competenceId,
                    tubes: [
                      {
                        id: 'recTube1',
                        skills: buildMaxLevelSkills(),
                      },
                    ],
                  },
                ],
              },
            ]);
            databaseBuilder.factory.learningContent.build(learningContentObjects);
            databaseBuilder.factory.buildKnowledgeState({
              userId,
              tubeId: 'recTube1',
              floor: MAX_REACHABLE_LEVEL,
              directLevels: [MAX_REACHABLE_LEVEL],
            });
            await databaseBuilder.commit();

            const options = {
              method: 'PUT',
              url: '/api/competence-evaluations/improve',
              headers: generateAuthenticatedUserRequestHeaders({ userId }),
              payload: { competenceId },
            };

            // when
            response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(403);
          });
        });
      });

      context('and competence evaluation does not exists', function () {
        it('should return 404 error', async function () {
          // given
          const options = {
            method: 'PUT',
            url: '/api/competence-evaluations/improve',
            headers: generateAuthenticatedUserRequestHeaders({ userId }),
            payload: { competenceId: 'WRONG_ID' },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    context('When user is not authenticated', function () {
      it('should return 401 error', async function () {
        // given
        const options = {
          method: 'PUT',
          url: '/api/competence-evaluations/improve',
          headers: {
            authorization: null,
          },
          payload: { competenceId },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
