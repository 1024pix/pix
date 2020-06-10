const createServer = require('../../../server');
const { expect, generateValidRequestAuthorizationHeader, airtableBuilder, databaseBuilder, knex } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | API | Improve Competence Evaluation', () => {

  let server;
  let userId;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
    server = await createServer();
  });

  describe('POST /api/competence-evaluations/improve', () => {

    const competenceId = 'recABCD123';
    const options = {
      method: 'POST',
      url: '/api/competence-evaluations/improve',
      headers: {
        authorization: generateValidRequestAuthorizationHeader(userId)
      },
      payload: { competenceId },
    };

    context('When user is authenticated', () => {

      beforeEach(async () => {
        const airtableCompetence = airtableBuilder.factory.buildCompetence({
          id: competenceId,
        });
        airtableBuilder
          .mockList({ tableName: 'Competences' })
          .returns([airtableCompetence])
          .activate();
      });

      afterEach(async () => {
        airtableBuilder.cleanAll();
        await knex('competence-evaluations').delete();
        await knex('assessments').delete();
        return cache.flushAll();
      });

      context('and competence exists', () => {
        let response, assessment;

        beforeEach(async () => {
          // given
          options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
          databaseBuilder.factory.buildCompetenceEvaluation({ competenceId, userId });
          await databaseBuilder.commit();

          // when
          response = await server.inject(options);
          assessment = response.result.data.relationships.assessment.data;
        });

        it('should return 200 and the competence evaluation', async () => {
          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result.data.id).to.exist;
          expect(assessment.id).to.be.not.null;
          expect(assessment).to.be.not.undefined;
        });

        it('should create an improving assessment', async () => {
          // then
          const [createdAssessment] = await knex('assessments').select().where({ id: assessment.id });
          expect(createdAssessment.isImproving).to.equal(true);
        });

      });

      context('and competence evaluation does not exists', () => {

        it('should return 404 error', async () => {
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

    context('When user is not authenticated', () => {

      it('should return 401 error', async () => {
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
