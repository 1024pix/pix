import createServer from '../../../../server';

import {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
} from '../../../test-helper';

import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../lib/domain/constants';

describe('Acceptance | API | Competence Evaluations', function () {
  let server;
  let userId;

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
    server = await createServer();
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

        const learningContentObjects = learningContentBuilder.buildLearningContent.fromAreas(learningContent);
        mockLearningContent(learningContentObjects);
      });

      afterEach(async function () {
        await knex('competence-evaluations').delete();
        await knex('assessments').delete();
      });

      context('and competence exists', function () {
        it('should return 201 and the competence evaluation when it has been successfully created', async function () {
          // when
          const options = {
            method: 'POST',
            url: '/api/competence-evaluations/start-or-resume',
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
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
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
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
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
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
      afterEach(async function () {
        await knex('competence-evaluations').delete();
        await knex('knowledge-elements').delete();
        await knex('answers').delete();
        await knex('assessments').delete();
      });

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
              headers: {
                authorization: generateValidRequestAuthorizationHeader(userId),
              },
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
            databaseBuilder.factory.buildKnowledgeElement({
              earnedPix: MAX_REACHABLE_PIX_BY_COMPETENCE,
              competenceId,
              userId,
            });
            await databaseBuilder.commit();

            const options = {
              method: 'PUT',
              url: '/api/competence-evaluations/improve',
              headers: {
                authorization: generateValidRequestAuthorizationHeader(userId),
              },
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
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
            },
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
