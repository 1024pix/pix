const jsonwebtoken = require('jsonwebtoken');
const { expect, knex } = require('../../../test-helper');
const authenticationSessionService = require('../../../../lib/domain/services/authentication/authentication-session-service');

const createServer = require('../../../../server');
const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');

describe('Acceptance | Route | pole emploi users', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/pole-emploi/users?authentication-key=key', function () {
    const firstName = 'firstName';
    const lastName = 'lastName';
    const externalIdentifier = 'idIdentiteExterne';

    afterEach(async function () {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return 200 HTTP status', async function () {
      // given
      const idToken = jsonwebtoken.sign(
        {
          given_name: firstName,
          family_name: lastName,
          nonce: 'nonce',
          idIdentiteExterne: externalIdentifier,
        },
        'secret'
      );

      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        expiresIn: 10,
        idToken,
        refreshToken: 'refreshToken',
      });
      const userAuthenticationKey = await authenticationSessionService.save(poleEmploiTokens);

      const request = {
        method: 'POST',
        url: `/api/pole-emploi/users?authentication-key=${userAuthenticationKey}`,
      };

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

    context('when authentication key has expired', function () {
      it('should return 401 HTTP status', async function () {
        // given
        const userAuthenticationKey = 'authentication_expired';

        const request = {
          method: 'POST',
          url: `/api/pole-emploi/users?authentication-key=${userAuthenticationKey}`,
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
