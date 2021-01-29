const { expect, knex } = require('../../test-helper');
const createServer = require('../../../server');
const authenticationCache = require('../../../lib/infrastructure/caches/authentication-cache');
const jsonwebtoken = require('jsonwebtoken');

describe('Acceptance | API | Pole Emploi Controller', () => {

  let server, request;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/pole-emploi/certification-centers', () => {

    const userAuthenticationKey = 'userAuthenticationKey';

    const firstName = 'firstName';
    const lastName = 'lastName';
    const externalIdentifier = 'idIdentiteExterne';

    beforeEach(() => {
      const idToken = jsonwebtoken.sign({
        'given_name': firstName,
        'family_name': lastName,
        nonce: 'nonce',
        idIdentiteExterne: externalIdentifier,
      }, 'secret');

      const userCredentials = {
        accessToken: 'accessToken',
        idToken,
        expiresIn: 10,
        refreshToken: 'refreshToken',
      };
      authenticationCache.set(userAuthenticationKey, userCredentials);

      request = {
        method: 'POST',
        url: `/api/pole-emploi/users?authentication-key=${userAuthenticationKey}`,
      };
    });

    afterEach(async () => {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return 200 HTTP status', async () => {
      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);

      const createdUser = await knex('users').first();
      expect(createdUser.firstName).to.equal(firstName);
      expect(createdUser.lastName).to.equal(lastName);

      const createdAuthenticationMethod = await knex('authentication-methods').first();
      expect(createdAuthenticationMethod.externalIdentifier).to.equal(externalIdentifier);
    });
  });
});
