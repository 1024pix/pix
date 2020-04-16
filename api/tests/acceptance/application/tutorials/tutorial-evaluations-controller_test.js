const { airtableBuilder, databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../../server');

describe('Acceptance | Controller | tutorial-evaluations-controller', () => {

  let server;

  beforeEach(async () => {
    await cache.flushAll();
    server = await createServer();
    await databaseBuilder.factory.buildUser({
      id: 4444,
      firstName: 'Classic',
      lastName: 'Papa',
      email: 'classic.papa@example.net',
      password: 'abcd1234',
    });
    await databaseBuilder.commit();

    const tutorial = airtableBuilder.factory.buildTutorial({ id: 'tutorialId' });
    airtableBuilder.mockList({ tableName: 'Tutoriels' })
      .returns([tutorial])
      .activate();
  });

  afterEach(async () => {
    return airtableBuilder.cleanAll();
  });

  after(() => {
    return cache.flushAll();
  });

  describe('PUT /api/users/tutorials/{tutorialId}/evaluate', () => {

    let options;

    beforeEach(async () => {
      await cache.flushAll();
      options = {
        method: 'PUT',
        url: '/api/users/tutorials/tutorialId/evaluate',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444)
        },
      };
    });

    afterEach(async () => {
      airtableBuilder.cleanAll();
      return knex('tutorial-evaluations').delete();
    });

    describe('nominal case', () => {
      it('should respond with a 201', async () => {
        // given
        const expectedResponse = {
          data: {
            type: 'tutorial-evaluations',
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.deep.equal(expectedResponse.data.type);
      });
    });

    describe('error cases', () => {
      it('should respond with a 404 - not found when tutorialId does not exist', async () => {
        // given
        options.url = '/api/users/tutorials/badId/evaluate';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 401 - not authenticated when user not connected', async () => {
        // given
        options.headers = {};

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

  });

});
