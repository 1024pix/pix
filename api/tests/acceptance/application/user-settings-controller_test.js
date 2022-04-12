import { expect, generateValidRequestAuthorizationHeader, databaseBuilder, knex } from '../../test-helper.js';
import { createServer } from '../../../server.js';

describe('Acceptance | Controller | user-settings-controller', function () {
  let server;
  let userId;

  beforeEach(async function () {
    server = await createServer();
    userId = await databaseBuilder.factory.buildUser().id;
    await databaseBuilder.commit();
  });

  afterEach(async function () {
    return knex('user-settings').delete();
  });

  describe('GET /api/user-settings/{userId}', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'GET',
        url: '/api/user-settings/' + userId,
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };
    });

    describe('nominal case', function () {
      it('should respond with a 200 and return user-settings', async function () {
        // given
        await databaseBuilder.factory.buildUserSettings({ userId, color: 'red' });
        await databaseBuilder.commit();
        const expectedUserSettings = {
          data: {
            type: 'user-settings',
            attributes: {
              color: 'red',
              'user-id': userId,
            },
          },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes.color).to.equal(expectedUserSettings.data.attributes.color);
      });

      it('should respond with a 404 when user-settings does not exist', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    describe('error cases', function () {
      it('should respond with a 401 when user is not logged in', async function () {
        // given
        options.headers.authorization = undefined;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
  describe('PUT /api/user-settings', function () {
    let options;

    beforeEach(async function () {
      options = {
        method: 'PUT',
        url: '/api/user-settings',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
      };
    });

    describe('nominal case', function () {
      it('should respond with a 201 and return user-settings created', async function () {
        // given
        const expectedUserSettings = {
          data: {
            type: 'user-settings',
            attributes: {
              color: 'red',
            },
          },
        };
        options.payload = { data: { attributes: { color: 'red' } } };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result.data.attributes.color).to.equal(expectedUserSettings.data.attributes.color);
      });
    });

    describe('error cases', function () {
      it('should respond with a 401 when user is not logged in', async function () {
        // given
        options.headers.authorization = undefined;

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
