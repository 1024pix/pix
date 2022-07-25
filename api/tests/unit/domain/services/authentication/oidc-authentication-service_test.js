const { expect, sinon, catchErr } = require('../../../../test-helper');
const settings = require('../../../../../lib/config');

const OidcAuthenticationService = require('../../../../../lib/domain/services/authentication/oidc-authentication-service');
const jsonwebtoken = require('jsonwebtoken');
const httpAgent = require('../../../../../lib/infrastructure/http/http-agent');
const AuthenticationSessionContent = require('../../../../../lib/domain/models/AuthenticationSessionContent');
const { AuthenticationTokenRetrievalError } = require('../../../../../lib/domain/errors');

describe('Unit | Domain | Services | oidc-authentication-service', function () {
  describe('#createAccessToken', function () {
    it('should create access token with user id, source and identityProvider', function () {
      // given
      const userId = 42;
      const accessToken = Symbol('valid access token');
      const source = Symbol('an oidc source');
      const identityProvider = Symbol('name of identityProvider');
      settings.authentication.secret = 'a secret';
      const payload = {
        user_id: userId,
        source,
        identity_provider: identityProvider,
      };
      const secret = 'a secret';
      const jwtOptions = { expiresIn: 1 };
      sinon.stub(jsonwebtoken, 'sign').withArgs(payload, secret, jwtOptions).returns(accessToken);

      const oidcAuthenticationService = new OidcAuthenticationService({ source, identityProvider, jwtOptions });

      // when
      const result = oidcAuthenticationService.createAccessToken(userId);

      // then
      expect(result).to.equal(accessToken);
    });
  });

  describe('#exchangeCodeForTokens', function () {
    it('should return id token', async function () {
      // given
      const clientId = 'OIDC_CLIENT_ID';
      const tokenUrl = 'http://oidc.net/api/token';
      const clientSecret = 'OIDC_CLIENT_SECRET';
      const accessToken = Symbol('access token');
      const expiresIn = Symbol(60);
      const idToken = Symbol('idToken');
      const refreshToken = Symbol('refreshToken');

      const oidcAuthenticationSessionContent = new AuthenticationSessionContent({
        idToken,
        accessToken,
        expiresIn,
        refreshToken,
      });

      sinon.stub(httpAgent, 'post');
      httpAgent.post.resolves({
        isSuccessful: true,
        data: {
          id_token: oidcAuthenticationSessionContent.idToken,
          access_token: oidcAuthenticationSessionContent.accessToken,
          refresh_token: oidcAuthenticationSessionContent.refreshToken,
          expires_in: oidcAuthenticationSessionContent.expiresIn,
        },
      });

      const oidcAuthenticationService = new OidcAuthenticationService({ clientSecret, clientId, tokenUrl });

      // when
      const result = await oidcAuthenticationService.exchangeCodeForTokens({
        code: 'AUTH_CODE',
        redirectUri: 'pix.net/connexion/oidc',
      });

      // then
      const expectedData = `client_secret=OIDC_CLIENT_SECRET&grant_type=authorization_code&code=AUTH_CODE&client_id=OIDC_CLIENT_ID&redirect_uri=pix.net%2Fconnexion%2Foidc`;
      const expectedHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

      expect(httpAgent.post).to.have.been.calledWith({
        url: 'http://oidc.net/api/token',
        payload: expectedData,
        headers: expectedHeaders,
      });
      expect(result).to.be.an.instanceOf(AuthenticationSessionContent);
      expect(result).to.deep.equal(oidcAuthenticationSessionContent);
    });

    context('when tokens retrieval fails', function () {
      it('should log error and throw AuthenticationTokenRetrievalError', async function () {
        // given
        const clientId = 'OIDC_CLIENT_ID';
        const tokenUrl = 'http://oidc.net/api/token';
        const clientSecret = 'OIDC_CLIENT_SECRET';

        sinon.stub(httpAgent, 'post');
        httpAgent.post.resolves({
          isSuccessful: false,
          code: 400,
          data: {
            error: 'invalid_client',
            error_description: 'Invalid authentication method for accessing this endpoint.',
          },
        });

        const oidcAuthenticationService = new OidcAuthenticationService({ clientSecret, clientId, tokenUrl });

        // when
        const error = await catchErr(
          oidcAuthenticationService.exchangeCodeForTokens,
          oidcAuthenticationService
        )({
          code: 'AUTH_CODE',
          redirectUri: 'pix.net/connexion/oidc',
        });

        // then
        expect(error).to.be.an.instanceOf(AuthenticationTokenRetrievalError);
        expect(error.message).to.equal(
          '{"error":"invalid_client","error_description":"Invalid authentication method for accessing this endpoint."}'
        );
      });
    });
  });
});
