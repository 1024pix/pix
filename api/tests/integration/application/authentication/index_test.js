import { createServer, expect } from '../../../test-helper.js';

describe('Integration | Application | Route | AuthenticationRouter', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/token-from-external-user', function () {
    const method = 'POST';
    const url = '/api/token-from-external-user';

    let payload;

    beforeEach(function () {
      payload = {
        data: {
          attributes: {
            username: 'saml.jackson0101',
            password: 'password',
            'external-user-token': 'expectedExternalToken',
            'expected-user-id': 1,
          },
          type: 'external-user-authentication-requests',
        },
      };
    });

    it('should return a 400 Bad Request if username is missing', async function () {
      // given
      payload.data.attributes.username = undefined;

      // when
      const response = await server.inject({ method, url, payload });

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 Bad Request if password is missing', async function () {
      // given
      payload.data.attributes.password = undefined;

      // when
      const response = await server.inject({ method, url, payload });

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 Bad Request if external-user-token is missing', async function () {
      // given
      payload.data.attributes['external-user-token'] = undefined;

      // when
      const response = await server.inject({ method, url, payload });

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 Bad Request if expected-user-id is missing', async function () {
      // given
      payload.data.attributes['expected-user-id'] = undefined;

      // when
      const response = await server.inject({ method, url, payload });

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
