const { mockLearningContent, databaseBuilder, expect, knex, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | tutorial-evaluations-controller', function() {

  let server;

  const learningContent = {
    tutorials: [{
      id: 'tutorialId',
      locale: 'en-us',
      duration: '00:03:31',
      format: 'vidéo',
      link: 'http://www.example.com/this-is-an-example.html',
      source: 'Source Example, Example',
      title: 'Communiquer',
    }],
  };

  beforeEach(async function() {
    server = await createServer();
    await databaseBuilder.factory.buildUser({
      id: 4444,
      firstName: 'Classic',
      lastName: 'Papa',
      email: 'classic.papa@example.net',
      password: 'abcd1234',
    });
    await databaseBuilder.commit();

    mockLearningContent(learningContent);
  });

  describe('PUT /api/users/tutorials/{tutorialId}/evaluate', function() {

    let options;

    beforeEach(async function() {
      options = {
        method: 'PUT',
        url: '/api/users/tutorials/tutorialId/evaluate',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(4444),
        },
      };
    });

    afterEach(async function() {
      return knex('tutorial-evaluations').delete();
    });

    describe('nominal case', function() {
      it('should respond with a 201', async function() {
        // given
        const expectedResponse = {
          data: {
            type: 'tutorial-evaluations',
            id: '1',
            attributes: {
              'tutorial-id': 'tutorialId',
              'user-id': 4444,
            },
          },
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

    describe('error cases', function() {
      it('should respond with a 404 - not found when tutorialId does not exist', async function() {
        // given
        options.url = '/api/users/tutorials/badId/evaluate';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 401 - not authenticated when user not connected', async function() {
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
