const { expect, sinon, catchErr } = require('../../../../test-helper');
const { GenerateCnavTokensError } = require('../../../../../lib/domain/errors');
const settings = require('../../../../../lib/config');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');
const jsonwebtoken = require('jsonwebtoken');

const cnavAuthenticationService = require('../../../../../lib/domain/services/authentication/cnav-authentication-service');

describe('Unit | Domain | Services | cnav-authentication-service', function () {
  describe('#exchangeCodeForTokens', function () {
    beforeEach(function () {
      sinon.stub(httpAgent, 'post');
    });

    it('should return access token and validity period', async function () {
      // given
      sinon.stub(settings.cnav, 'clientId').value('CNAV_CLIENT_ID');
      sinon.stub(settings.cnav, 'tokenUrl').value('http://cnav-igation.net/api/token');
      sinon.stub(settings.cnav, 'clientSecret').value('CNAV_CLIENT_SECRET');

      const idToken = 'idToken';

      const response = {
        isSuccessful: true,
        data: {
          id_token: idToken,
        },
      };
      httpAgent.post.resolves(response);

      // when
      const result = await cnavAuthenticationService.exchangeCodeForTokens({
        code: 'AUTH_CODE',
        redirectUri: 'pix.net/connexion-cnav-igation',
      });

      // then
      const expectedData = `client_secret=CNAV_CLIENT_SECRET&grant_type=authorization_code&code=AUTH_CODE&client_id=CNAV_CLIENT_ID&redirect_uri=pix.net%2Fconnexion-cnav-igation`;
      const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

      expect(httpAgent.post).to.have.been.calledWith({
        url: 'http://cnav-igation.net/api/token',
        payload: expectedData,
        headers: expectedHeaders,
      });
      expect(result).to.equal(idToken);
    });

    context('when PE tokens generation fails', function () {
      it('should log error and throw GenerateCnavTokensError', async function () {
        // given
        const code = 'code';
        const clientId = 'clientId';
        const redirectUri = 'redirectUri';

        const errorData = {
          error: 'invalid_client',
          error_description: 'Invalid authentication method for accessing this endpoint.',
        };
        const expectedMessage = `${errorData.error} ${errorData.error_description}`;

        const response = {
          isSuccessful: false,
          code: 400,
          data: errorData,
        };
        httpAgent.post.resolves(response);

        // when
        const error = await catchErr(cnavAuthenticationService.exchangeCodeForTokens)({
          code,
          clientId,
          redirectUri,
        });

        // then
        expect(error).to.be.an.instanceOf(GenerateCnavTokensError);
        expect(error.message).to.equal(expectedMessage);
      });
    });
  });

  describe('#getUserInfo', function () {
    it('should return email, firstName, lastName and external identity id', async function () {
      // given
      const cert_priv =
        '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAvzoCEC2rpSpJQaWZbUmlsDNwp83Jr4fi6KmBWIwnj1MZ6CUQ7rBasuLI8AcfX5/10scSfQNCsTLV2tMKQaHuvyrVfwY0dINk+nkqB74QcT2oCCH9XduJjDuwWA4xLqAKuF96FsIes52opEM50W7/W7DZCKXkC8fFPFj6QF5ZzApDw2Qsu3yMRmr7/W9uWeaTwfPx24YdY7Ah+fdLy3KN40vXv9c4xiSafVvnx9BwYL7H1Q8NiK9LGEN6+JSWfgckQCs6UUBOXSZdreNN9zbQCwyzee7bOJqXUDAuLcFARzPw1EsZAyjVtGCKIQ0/btqK+jFunT2NBC8RItanDZpptQIDAQABAoIBAQCsssO4Pra8hFMCgX7tr0x+tAYy1ewmpW8stiDFilYT33YPLKJ9HjHbSms0MwqHftwwTm8JDc/GXmW6qUui+I64gQOtIzpuW1fvyUtHEMSisI83QRMkF6fCSQm6jJ6oQAtOdZO6R/gYOPNb3gayeS8PbMilQcSRSwp6tNTVGyC33p43uUUKAKHnpvAwUSc61aVOtw2wkD062XzMhJjYpHm65i4V31AzXo8HF42NrAtZ8K/AuQZne5F/6F4QFVlMKzUoHkSUnTp60XZxX77GuyDeDmCgSc2J7xvR5o6VpjsHMo3ek0gJk5ZBnTgkHvnpbULCRxTmDfjeVPuev3NN2TBFAoGBAPxbqNEsXPOckGTvG3tUOAAkrK1hfW3TwvrW/7YXg1/6aNV4sklcvqn/40kCK0v9xJIv9FM/l0Nq+CMWcrb4sjLeGwHAa8ASfk6hKHbeiTFamA6FBkvQ//7GP5khD+y62RlWi9PmwJY21lEkn2mP99THxqvZjQiAVNiqlYdwiIc7AoGBAMH8f2Ay7Egc2KYRYU2qwa5E/Cljn/9sdvUnWM+gOzUXpc5sBi+/SUUQT8y/rY4AUVW6YaK7chG9YokZQq7ZwTCsYxTfxHK2pnG/tXjOxLFQKBwppQfJcFSRLbw0lMbQoZBkS+zb0ufZzxc2fJfXE+XeJxmKs0TS9ltQuJiSqCPPAoGBALEc84K7DBG+FGmCl1sbZKJVGwwknA90zCeYtadrIT0/VkxchWSPvxE5Ep+u8gxHcqrXFTdILjWW4chefOyF5ytkTrgQAI+xawxsdyXWUZtd5dJq8lxLtx9srD4gwjh3et8ZqtFx5kCHBCu29Fr2PA4OmBUMfrs0tlfKgV+pT2j5AoGBAKnA0Z5XMZlxVM0OTH3wvYhI6fk2Kx8TxY2Gnxsh9m3hgcD/mvJRjEaZnZto6PFoqcRBU4taSNnpRr7+kfH8sCht0k7D+l8AIutLffx3xHv9zvvGHZqQ1nHKkaEuyjqo+5kli6N8QjWNzsFbdvBQ0CLJoqGhVHsXuWnzW3Z4cBbVAoGAEtnwY1OJM7+R2u1CW0tTjqDlYU2hUNa9t1AbhyGdI2arYp+p+umAb5VoYLNsdvZhqjVFTrYNEuhTJFYCF7jAiZLYvYm0C99BqcJnJPl7JjWynoNHNKw39f6PIOE1rAmPE8Cfz/GFF5115ZKVlq+2BY8EKNxbCIy2d/vMEvisnXI=\n-----END RSA PRIVATE KEY-----';

      function generateIdToken(payload) {
        return jsonwebtoken.sign(
          {
            ...payload,
          },
          cert_priv,
          { algorithm: 'RS256' }
        );
      }

      const given_name = 'givenName';
      const family_name = 'familyName';
      const nonce = 'bb041272-d6e6-457c-99fb-ff1aa02217fd';
      const sub = '094b83ac-2e20-4aa8-b438-0bc91748e4a6';

      const idToken = generateIdToken({
        given_name,
        family_name,
        nonce,
        sub,
      });

      // when
      const result = await cnavAuthenticationService.getUserInfo(idToken);

      // then
      expect(result).to.deep.equal({
        firstName: given_name,
        lastName: family_name,
        nonce,
        externalIdentityId: sub,
      });
    });
  });

  describe('#createAccessToken', function () {
    it('should create access token with user id and source', function () {
      // given
      const userId = 123;
      settings.authentication.secret = 'a secret';
      settings.cnav.accessTokenLifespanMs = 1000;
      const accessToken = 'valid access token';
      const firstParameter = { user_id: userId, source: 'cnav' };
      const secondParameter = 'a secret';
      const thirdParameter = { expiresIn: 1 };
      sinon.stub(jsonwebtoken, 'sign').withArgs(firstParameter, secondParameter, thirdParameter).returns(accessToken);

      // when
      const result = cnavAuthenticationService.createAccessToken(userId);

      // then
      expect(result).to.be.deep.equal(accessToken);
    });
  });
});
