import { TutorialEvaluation } from '../../../../../src/devcomp/domain/models/TutorialEvaluation.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | tutorial-evaluations-controller', function () {
  const learningContent = {
    tutorials: [
      {
        id: 'tutorialId',
        locale: 'en-us',
        duration: '00:03:31',
        format: 'vidéo',
        link: 'http://www.example.com/this-is-an-example.html',
        source: 'Source Example, Example',
        title: 'Communiquer',
      },
    ],
  };

  beforeEach(async function () {
    await databaseBuilder.factory.buildUser({
      id: 4444,
      firstName: 'Classic',
      lastName: 'Papa',
      email: 'classic.papa@example.net',
      password: 'abcd1234',
    });

    databaseBuilder.factory.learningContent.build(learningContent);
    await databaseBuilder.commit();
  });

  describe('PUT /api/users/tutorials/{tutorialId}/evaluate', function () {
    let options;

    describe('nominal case', function () {
      it('should respond with a 201 when a status is provided', async function () {
        // given
        options = {
          method: 'PUT',
          url: '/api/users/tutorials/tutorialId/evaluate',
          headers: generateAuthenticatedUserRequestHeaders({ userId: 4444 }),
          payload: {
            data: {
              type: 'tutorial-evaluations',
              attributes: {
                'tutorial-id': 'tutorialId',
                'user-id': 4444,
                status: TutorialEvaluation.statuses.LIKED,
              },
            },
          },
        };

        const expectedResponse = {
          data: {
            type: 'tutorial-evaluations',
            id: '1',
            attributes: {
              'tutorial-id': 'tutorialId',
              'user-id': 4444,
              status: TutorialEvaluation.statuses.LIKED,
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
        expect(response.result.data.attributes['tutorial-id']).to.deep.equal(
          expectedResponse.data.attributes['tutorial-id'],
        );
        expect(response.result.data.attributes.status).to.deep.equal(expectedResponse.data.attributes.status);
      });

      it('should respond with a 201 when no status is provided', async function () {
        // given
        options = {
          method: 'PUT',
          url: '/api/users/tutorials/tutorialId/evaluate',
          headers: generateAuthenticatedUserRequestHeaders({ userId: 4444 }),
          payload: {
            data: {
              type: 'tutorial-evaluations',
              attributes: {
                'tutorial-id': 'tutorialId',
                'user-id': 4444,
              },
            },
          },
        };

        const expectedResponse = {
          data: {
            type: 'tutorial-evaluations',
            id: '1',
            attributes: {
              'tutorial-id': 'tutorialId',
              'user-id': 4444,
              status: TutorialEvaluation.statuses.LIKED,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.type).to.equal(expectedResponse.data.type);
        expect(response.result.data.id).to.exist;
        expect(response.result.data.attributes['user-id']).to.equal(expectedResponse.data.attributes['user-id']);
        expect(response.result.data.attributes['tutorial-id']).to.equal(
          expectedResponse.data.attributes['tutorial-id'],
        );
        expect(response.result.data.attributes.status).to.equal(expectedResponse.data.attributes.status);
      });
    });

    describe('error cases', function () {
      it('should respond with a 404 - not found when tutorialId does not exist', async function () {
        // given
        options.url = '/api/users/tutorials/badId/evaluate';

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond with a 401 - not authenticated when user not connected', async function () {
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
