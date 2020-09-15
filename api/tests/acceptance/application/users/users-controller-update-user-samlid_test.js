const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');

const tokenService = require('../../../../lib/domain/services/token-service');
const createServer = require('../../../../server');

describe('Acceptance | Controller | users-controller-update-user-samlid', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('PATCH api/users/{id}/authentication-methods/saml', () => {

    const userAttributes = {
      firstName: 'firstName',
      lastName: 'lastName',
      samlId: 'SAMLID',
    };

    let options;

    beforeEach(async () => {
      const user = databaseBuilder.factory.buildUser({ samlId: null });

      options = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
        method: 'PATCH',
        url: `/api/users/${user.id}/authentication-methods/saml`,
        payload: {
          data: {
            id: 1,
            type: 'external-users',
            attributes: {
              'external-user-token': tokenService.createIdTokenForUserReconciliation(userAttributes),
              'expected-user-id': user.id,
            },
          },
        },
      };

      await databaseBuilder.commit();
    });

    it('should update user samlId', async () => {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
      // given
      options.headers.authorization = 'invalid.access.token';

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should respond with a 403 - forbidden access - if requested user is not the same as authenticated user', async () => {
      // given
      const otherUserId = 1;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should respond with a 400 if externalUserToken is missing', async () => {
      // given
      options.payload.data.attributes['external-user-token'] = {};

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should respond with a 401 if externalUserToken is invalid', async () => {
      // given
      const expectedErrorMessage = 'Une erreur est survenue. Veuillez réessayer de vous connecter depuis le médiacentre.';
      options.payload.data.attributes['external-user-token'] = 'ABCD';
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
      expect(response.result.errors[0].detail).to.equal(expectedErrorMessage);
    });

    it('should respond with a 404 if the user is not found', async () => {
      // given
      const missingUserId = 9999;
      const expectedErrorMessage = `User not found for ID ${missingUserId}`;
      options.headers.authorization = generateValidRequestAuthorizationHeader(missingUserId);
      options.url = `/api/users/${missingUserId}/authentication-methods/saml`;
      options.payload.data.attributes['expected-user-id'] = missingUserId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.result.errors[0].detail).to.equal(expectedErrorMessage);
    });

    it('should respond with a 404 if the expected user is not found', async () => {
      // given
      const nonExistentUserId = 9999;
      const expectedErrorMessage = `User not found for ID ${nonExistentUserId}`;
      options.payload.data.attributes['expected-user-id'] = nonExistentUserId;

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(404);
      expect(response.result.errors[0].detail).to.equal(expectedErrorMessage);
    });
  });
});
