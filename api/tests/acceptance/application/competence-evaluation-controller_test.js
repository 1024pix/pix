const createServer = require('../../../server');
const { expect, generateValidRequestAuthorizationHeader, airtableBuilder, databaseBuilder, knex } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | API | Competence Evaluations', () => {

  let server;
  let userId;

  beforeEach(async () => {
    userId = databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
    server = await createServer();
  });

  describe('POST /api/competence-evaluations/start-or-resume', () => {

    const competenceId = 'recABCD123';
    const options = {
      method: 'POST',
      url: '/api/competence-evaluations/start-or-resume',
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
        airtableBuilder
          .mockList({ tableName: 'Domaines' })
          .returns({})
          .activate();
      });

      afterEach(async () => {
        airtableBuilder.cleanAll();
        await knex('competence-evaluations').delete();
        await knex('assessments').delete();
        return cache.flushAll();
      });

      context('and competence exists', () => {

        it('should return 201 and the competence evaluation when it has been successfully created', async () => {
          // when
          options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['assessment-id']).to.be.not.null;
        });

        it('should return 200 and the competence evaluation when it has been successfully found', async () => {
          // given
          options.headers = { authorization: generateValidRequestAuthorizationHeader(userId) };
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

      context('and competence does not exists', () => {

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

  describe('GET /api/competence-evaluations', () => {
    let options;
    let assessment, competenceEvaluation;

    beforeEach(async () => {
      assessment = databaseBuilder.factory.buildAssessment({ userId });
      competenceEvaluation = databaseBuilder.factory.buildCompetenceEvaluation({
        assessmentId: assessment.id,
        status: 'started',
        userId,
      });

      await databaseBuilder.commit();

      options = {
        method: 'GET',
        url: `/api/competence-evaluations?filter[assessmentId]=${assessment.id}`,
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
    });

    it('should return the competence-evaluation of the given assessmentId', async () => {
      // given
      const expectedCompetenceEvaluations = [
        {
          attributes: {
            'user-id': userId,
            'competence-id': competenceEvaluation.competenceId,
            'created-at': competenceEvaluation.createdAt,
            'updated-at': competenceEvaluation.updatedAt,
            'status': competenceEvaluation.status,
          },
          id: competenceEvaluation.id.toString(),
          type: 'competence-evaluations',
          relationships: {
            assessment: {
              data: {
                id: assessment.id.toString(),
                type: 'assessments'
              }
            },
            scorecard: {
              links: {
                related: `/api/scorecards/${userId}_${competenceEvaluation.competenceId}`
              }
            }
          }
        }
      ];

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.be.deep.equal(expectedCompetenceEvaluations);
    });
  });
});
