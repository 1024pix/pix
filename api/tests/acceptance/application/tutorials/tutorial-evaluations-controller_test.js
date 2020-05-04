const { airtableBuilder, databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../../server');

describe('Acceptance | Controller | tutorial-evaluations-controller', () => {

  let server;

  beforeEach(async () => {
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

  describe('PUT /api/users/tutorials/{tutorialId}/evaluate', () => {

    let options;

    beforeEach(async () => {
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
      cache.flushAll();
      return knex('tutorial-evaluations').delete();
    });

    describe('nominal case', () => {
      it('should respond with a 201', async () => {
        // given
        const expectedResponse = {
          data: {
            type: 'tutorial-evaluations',
            id: '1',
            attributes: {
              'tutorial-id': 'tutorialId',
              'user-id': 4444,
            }
          }
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.deep.equal(expectedResponse.data.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes['user-id']).to.deep.equal(expectedResponse.data.attributes['user-id']);
        expect(response.result.data.attributes['tutorial-id']).to.deep.equal(expectedResponse.data.attributes['tutorial-id']);
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
