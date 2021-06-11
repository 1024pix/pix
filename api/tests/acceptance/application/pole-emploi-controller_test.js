const jsonwebtoken = require('jsonwebtoken');

const { expect, knex } = require('../../test-helper');

const PoleEmploiTokens = require('../../../lib/domain/models/PoleEmploiTokens');
const poleEmploiTokensRepository = require('../../../lib/infrastructure/repositories/pole-emploi-tokens-repository');

const createServer = require('../../../server');

describe('Acceptance | API | Pole Emploi Controller', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/pole-emplois/users?authentication-key=key', () => {

    const firstName = 'firstName';
    const lastName = 'lastName';
    const externalIdentifier = 'idIdentiteExterne';

    afterEach(async () => {
      await knex('authentication-methods').delete();
      await knex('users').delete();
    });

    it('should return 200 HTTP status', async () => {
      // given
      const idToken = jsonwebtoken.sign({
        'given_name': firstName,
        'family_name': lastName,
        nonce: 'nonce',
        idIdentiteExterne: externalIdentifier,
      }, 'secret');

      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        expiresIn: 10,
        idToken,
        refreshToken: 'refreshToken',
      });
      const userAuthenticationKey = await poleEmploiTokensRepository.save(poleEmploiTokens);

      const request = {
        method: 'POST',
        url: `/api/pole-emplois/users?authentication-key=${userAuthenticationKey}`,
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
  });
});
