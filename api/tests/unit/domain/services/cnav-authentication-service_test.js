const { expect, sinon, catchErr } = require('../../../test-helper');

const { GenerateCnavTokensError } = require('../../../../lib/domain/errors');

const CnavTokens = require('../../../../lib/domain/models/CnavTokens');

const settings = require('../../../../lib/config');
const httpAgent = require('../../../../lib/infrastructure/http/http-agent');

const tokenService = require('../../../../lib/domain/services/token-service');

const cnavAuthenticationService = require('../../../../lib/domain/services/cnav-authentication-service');

describe('Unit | Domain | Services | cnav-authentication-service', function () {
  describe('#exchangeCodeForTokens', function () {
    beforeEach(function () {
      sinon.stub(httpAgent, 'post');
    });

    it('should return access token, id token and validity period', async function () {
      // given
      sinon.stub(settings.cnav, 'clientId').value('CNAV_CLIENT_ID');
      sinon.stub(settings.cnav, 'tokenUrl').value('http://cnav-igation.net/api/token');
      sinon.stub(settings.cnav, 'clientSecret').value('CNAV_CLIENT_SECRET');

      const cnavTokens = new CnavTokens({
        accessToken: 'accessToken',
        expiresIn: 60,
        idToken: 'idToken',
        refreshToken: 'refreshToken',
      });

      const response = {
        isSuccessful: true,
        data: {
          access_token: cnavTokens.accessToken,
          expires_in: cnavTokens.expiresIn,
          id_token: cnavTokens.idToken,
          refresh_token: cnavTokens.refreshToken,
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
      expect(result).to.be.an.instanceOf(CnavTokens);
      expect(result).to.deep.equal(cnavTokens);
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
    beforeEach(function () {
      sinon.stub(tokenService, 'extractClaimsFromCnavIdToken');
    });

    it('should return email, firstName, lastName and external identity id', async function () {
      // given
      const idToken = 'ID_TOKEN';
      const payloadFromIdToken = {
        given_name: 'givenName',
        family_name: 'familyName',
        nonce: 'bb041272-d6e6-457c-99fb-ff1aa02217fd',
        sub: 'some-user-unique-id',
      };

      tokenService.extractClaimsFromCnavIdToken.resolves(payloadFromIdToken);

      const expectedResult = {
        firstName: payloadFromIdToken.given_name,
        lastName: payloadFromIdToken.family_name,
        nonce: payloadFromIdToken.nonce,
        externalIdentityId: 'some-user-unique-id',
      };

      // when
      const result = await cnavAuthenticationService.getUserInfo(idToken);

      // then
      expect(result).to.deep.equal(expectedResult);
    });
  });
});
