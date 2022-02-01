const createServer = require('../../../server');
const {
  expect,
  generateValidRequestAuthorizationHeader,
  databaseBuilder,
  knex,
  mockLearningContent,
  learningContentBuilder,
} = require('../../test-helper');

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

        const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
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
});
