const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex, mockLearningContent, learningContentBuilder, HttpTestServer } = require('../../test-helper');

const moduleUnderTest = require('../../../lib/application/competence-evaluations');

describe('Acceptance | API | Competence Evaluations', () => {

  let server;
  let userId;

  before(async () => {
    const authenticationEnabled = true;
    server = new HttpTestServer(moduleUnderTest, authenticationEnabled);
  });

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  describe('POST /api/competence-evaluations/start-or-resume', () => {

    const competenceId = 'recABCD123';
    const request = {
      method: 'POST',
      url: '/api/competence-evaluations/start-or-resume',
      headers: {
        authorization: generateValidRequestAuthorizationHeader(userId),
      },
      payload: { competenceId },
    };

    context('When user is authenticated', () => {

      beforeEach(async () => {
        const learningContent = [{
          id: 'recArea1',
          competences: [{
            id: competenceId,
            tubes: [],
          }],
        }];

        const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
        mockLearningContent(learningContentObjects);
      });

      afterEach(async () => {
        await knex('competence-evaluations').delete();
        await knex('assessments').delete();
      });

      context('and competence exists', () => {

        it('should return 201 and the competence evaluation when it has been successfully created', async () => {
          // when
          request.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
          const response = await server.requestObject(request);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['assessment-id']).to.be.not.null;
        });

        it('should return 200 and the competence evaluation when it has been successfully found', async () => {
          // given
          request.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
          databaseBuilder.factory.buildCompetenceEvaluation({ competenceId, userId });
          await databaseBuilder.commit();

          // when
          const response = await server.requestObject(request);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['assessment-id']).to.be.not.null;
        });
      });

      context('and competence does not exists', () => {

        it('should return 404 error', async () => {
          // given
          request.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
          request.payload.competenceId = 'WRONG_ID';

          // when
          const response = await server.requestObject(request);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    context('When user is not authenticated', () => {

      it('should return 401 error', async () => {
        // given
        request.headers.authorization = null;

        // when
        const response = await server.requestObject(request);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
