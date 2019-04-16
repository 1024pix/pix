const createServer = require('../../../server');
const { expect, generateValidRequestAuhorizationHeader, airtableBuilder, databaseBuilder, knex } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/cache');

describe('Acceptance | API | Competence Evaluations', () => {

  let server;
  const competenceId = 'recABCD123';
  const userId = 24504875;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/competence-evaluations', () => {

    const options = {
      method: 'POST',
      url: '/api/competence-evaluations',
      headers: {
        authorization: generateValidRequestAuhorizationHeader(userId)
      },
      payload: {
        data: {
          type: 'competence-evaluations',
          attributes: {
            'competence-id': competenceId,
          },
        }
      }
    };

    context('When user is authenticated', () => {
      context('and competence exists', () => {
        beforeEach(async () => {
          const airtableCompetence = airtableBuilder.factory.buildCompetence({
            id: competenceId,
          });
          airtableBuilder
            .mockGet({ tableName: 'Competences' })
            .returns(airtableCompetence)
            .activate();
          airtableBuilder
            .mockList({ tableName: 'Domaines' })
            .returns({})
            .activate();
        });

        afterEach(async () => {
          airtableBuilder.cleanAll();
          await cache.flushAll();
          await knex('competence-evaluations').delete();
          await databaseBuilder.clean();
        });

        it('should return 201 and the competence evaluation when it has been successfully created', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.exist;
          expect(response.result.data.attributes['assessment-id']).to.be.not.null;
        });

        it('should return 200 and the competence evaluation when it has been successfully found', async () => {
          // given
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
        it('should return 404 error', () => {
          // given
          options.payload.data.attributes['competence-id'] = null;

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(404);
          });
        });
      });
    });

    context('When user is not authenticated', () => {
      beforeEach(async () => {
        options.headers.authorization = null;
      });

      it('should return 401 error', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });
});
