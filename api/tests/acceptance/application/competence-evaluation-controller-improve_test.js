const createServer = require('../../../server');
const { expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex } = require('../../test-helper');
const { MAX_REACHABLE_PIX_BY_COMPETENCE } = require('../../../lib/domain/constants');

describe('Acceptance | API | Improve Competence Evaluation', function() {

  let server;
  let userId;

  beforeEach(async function() {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
    server = await createServer();
  });

  describe('POST /api/competence-evaluations/improve', function() {

    const competenceId = 'recABCD123';
    const options = {
      method: 'POST',
      url: '/api/competence-evaluations/improve',
      headers: {
        authorization: generateValidRequestAuthorizationHeader(userId),
      },
      payload: { competenceId },
    };

    context('When user is authenticated', function() {

      afterEach(async function() {
        await knex('competence-evaluations').delete();
        await knex('knowledge-elements').delete();
        await knex('answers').delete();
        await knex('assessments').delete();
      });

      context('and competence exists', function() {
        let response, assessment;

        beforeEach(async function() {
          // given
          options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
          databaseBuilder.factory.buildCompetenceEvaluation({ competenceId, userId });
          await databaseBuilder.commit();
        });

        context('and user has not reached maximum level of given competence', function() {

          beforeEach(async function() {
            await databaseBuilder.commit();

            // when
            response = await server.inject(options);
            assessment = response.result.data.relationships.assessment.data;
          });

          it('should return 200 and the competence evaluation', async function() {
            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result.data.id).to.exist;
            expect(assessment.id).to.be.not.null;
            expect(assessment).to.exist;
          });

          it('should create an improving assessment', async function() {
            // then
            const [createdAssessment] = await knex('assessments').select().where({ id: assessment.id });
            expect(createdAssessment.isImproving).to.equal(true);
          });
        });

        context('and user has reached maximum level of given competence', function() {

          beforeEach(async function() {
            databaseBuilder.factory.buildKnowledgeElement({ earnedPix: MAX_REACHABLE_PIX_BY_COMPETENCE, competenceId, userId });
            await databaseBuilder.commit();
          });

          it('should return 403 error', async function() {
            // when
            response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(403);
          });
        });
      });

      context('and competence evaluation does not exists', function() {

        it('should return 404 error', async function() {
          // given
          options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
          options.payload.competenceId = 'WRONG_ID';

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    context('When user is not authenticated', function() {

      it('should return 401 error', async function() {
        // given
        options.headers.authorization = null;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

});
