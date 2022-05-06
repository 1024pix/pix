const jsonwebtoken = require('jsonwebtoken');
const { expect, knex } = require('../../../test-helper');
const authenticationSessionService = require('../../../../lib/domain/services/authentication/authentication-session-service');

const createServer = require('../../../../server');

describe('Acceptance | Route | cnav users', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/cnav/users?authentication-key=key', function () {
    afterEach(async function () {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return 200 HTTP status', async function () {
      // given
      const idToken = jsonwebtoken.sign(
        {
          given_name: 'Brice',
          family_name: 'Glace',
          nonce: 'nonce',
          sub: 'some-user-unique-id',
        },
        'secret'
      );
      const userAuthenticationKey = await authenticationSessionService.save(idToken);

      const request = {
        method: 'POST',
        url: `/api/cnav/users?authentication-key=${userAuthenticationKey}`,
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result['access_token']).to.exist;

      const createdUser = await knex('users').first();
      expect(createdUser.firstName).to.equal('Brice');
      expect(createdUser.lastName).to.equal('Glace');

      const createdAuthenticationMethod = await knex('authentication-methods').first();
      expect(createdAuthenticationMethod.externalIdentifier).to.equal('some-user-unique-id');
    });

    context('when authentication key has expired', function () {
      it('should return 401 HTTP status', async function () {
        // given
        const userAuthenticationKey = 'authentication_expired';

        const request = {
          method: 'POST',
          url: `/api/cnav/users?authentication-key=${userAuthenticationKey}`,
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(401);
        expect(response.result.errors[0].detail).to.equal('This authentication key has expired.');
      });
    });
  });
});
