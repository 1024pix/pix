const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const tokenService = require('../../../../lib/domain/services/token-service');

describe('Acceptance | Route | PATCH api/users/{id}/authentication-methods/saml', () => {

  const userAttributes = {
    firstName: 'firstName',
    lastName: 'lastName',
    samlId: 'SAMLID',
  };

  let server;
  let options;

  beforeEach(async () => {
    server = await createServer();
    options = {
      method: 'PATCH',
      url: '',
      headers: {},
      payload: {
        data: {
          id: 1,
          type: 'external-users',
          attributes: {
            'external-user-token': tokenService.createIdTokenForUserReconciliation(userAttributes),
          },
        },
      },
    };
  });

  describe('Resource access management errors case', () => {

    beforeEach(async () => {
      options.url = '/api/users/1/authentication-methods/saml';
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
      const otherUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('Success cases', () => {

    it('should respond with no content when patch samlId succeeds', async () => {
      // given
      const userWithoutSamlId = databaseBuilder.factory.buildUser({ samlId: null });
      await databaseBuilder.commit();

      options.url = `/api/users/${userWithoutSamlId.id}/authentication-methods/saml`;
      options.headers.authorization = generateValidRequestAuthorizationHeader(userWithoutSamlId.id);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should respond with no content when samlId exist with the same user', async () => {
      // given
      const userWithSamlId = databaseBuilder.factory.buildUser({
        samlId: userAttributes.samlId,
      });
      await databaseBuilder.commit();

      options.url = `/api/users/${userWithSamlId.id}/authentication-methods/saml`;
      options.headers.authorization = generateValidRequestAuthorizationHeader(userWithSamlId.id);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
    });

  });

  describe('Errors case', () => {

    it('should respond with conflict error when samlId exists with another user', async () => {
      // given
      databaseBuilder.factory.buildUser({
        samlId: userAttributes.samlId,
      });
      const userWithoutSamlId = databaseBuilder.factory.buildUser({
        samlId: null,
      });
      await databaseBuilder.commit();

      options.url = `/api/users/${userWithoutSamlId.id}/authentication-methods/saml`;
      options.headers.authorization = generateValidRequestAuthorizationHeader(userWithoutSamlId.id);

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(409);
    });
  });

});
