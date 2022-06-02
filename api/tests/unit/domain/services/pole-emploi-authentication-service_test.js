const { expect, sinon, catchErr } = require('../../../test-helper');

const { GeneratePoleEmploiTokensError } = require('../../../../lib/domain/errors');

const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');

const settings = require('../../../../lib/config');
const httpAgent = require('../../../../lib/infrastructure/http/http-agent');

const tokenService = require('../../../../lib/domain/services/token-service');

const poleEmploiAuthenticationService = require('../../../../lib/domain/services/pole-emploi-authentication-service');

describe('Unit | Domain | Services | pole-emploi-authentication-service', function () {
  describe('#exchangeCodeForTokens', function () {
    beforeEach(function () {
      sinon.stub(httpAgent, 'post');
    });

    it('should return access token, id token and validity period', async function () {
      // given
      sinon.stub(settings.poleEmploi, 'clientId').value('PE_CLIENT_ID');
      sinon.stub(settings.poleEmploi, 'tokenUrl').value('http://paul-emploi.net/api/token');
      sinon.stub(settings.poleEmploi, 'clientSecret').value('PE_CLIENT_SECRET');

      const poleEmploiTokens = new PoleEmploiTokens({
        accessToken: 'accessToken',
        expiresIn: 60,
        idToken: 'idToken',
        refreshToken: 'refreshToken',
      });

      const response = {
        isSuccessful: true,
        data: {
          access_token: poleEmploiTokens.accessToken,
          expires_in: poleEmploiTokens.expiresIn,
          id_token: poleEmploiTokens.idToken,
          refresh_token: poleEmploiTokens.refreshToken,
        },
      };
      httpAgent.post.resolves(response);

      // when
      const result = await poleEmploiAuthenticationService.exchangeCodeForTokens({
        code: 'AUTH_CODE',
        redirectUri: 'pix.net/connexion-paul-emploi',
      });

      // then
      const expectedData = `client_secret=PE_CLIENT_SECRET&grant_type=authorization_code&code=AUTH_CODE&client_id=PE_CLIENT_ID&redirect_uri=pix.net%2Fconnexion-paul-emploi`;
      const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

      expect(httpAgent.post).to.have.been.calledWith({
        url: 'http://paul-emploi.net/api/token',
        payload: expectedData,
        headers: expectedHeaders,
      });
      expect(result).to.be.an.instanceOf(PoleEmploiTokens);
      expect(result).to.deep.equal(poleEmploiTokens);
    });

    context('when PE tokens generation fails', function () {
      it('should log error and throw GeneratePoleEmploiTokensError', async function () {
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
        const error = await catchErr(poleEmploiAuthenticationService.exchangeCodeForTokens)({
          code,
          clientId,
          redirectUri,
        });

        // then
        expect(error).to.be.an.instanceOf(GeneratePoleEmploiTokensError);
        expect(error.message).to.equal(expectedMessage);
      });
    });
  });

  describe('#getUserInfo', function () {
    beforeEach(function () {
      sinon.stub(tokenService, 'extractPayloadFromPoleEmploiIdToken');
    });

    it('should return email, firstName, lastName and external identity id', async function () {
      // given
      const idToken = 'ID_TOKEN';
      const payloadFromIdToken = {
        given_name: 'givenName',
        family_name: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        idIdentiteExterne: '094b83ac-2e20-4aa8-b438-0bc91748e4a6',
      };

      tokenService.extractPayloadFromPoleEmploiIdToken.resolves(payloadFromIdToken);

      const expectedResult = {
        firstName: payloadFromIdToken.given_name,
        lastName: payloadFromIdToken.family_name,
        nonce: payloadFromIdToken.nonce,
        externalIdentityId: payloadFromIdToken.idIdentiteExterne,
      };

      // when
      const result = await poleEmploiAuthenticationService.getUserInfo(idToken);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
