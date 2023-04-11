const { sinon, expect, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');

describe('Unit | Application | Controller | Authentication', function () {
  describe('#createToken', function () {
    const accessToken = 'jwt.access.token';
    const USER_ID = 1;
    const username = 'user@email.com';
    const password = 'user_password';
    const scope = 'pix-orga';
    const source = 'pix';

    /**
     * @see https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/
     */
    it('should return an OAuth 2 token response (even if we do not really implement OAuth 2 authorization protocol)', async function () {
      // given
      const expirationDelaySeconds = 6666;
      const refreshToken = 'refresh.token';
      const request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: {
          grant_type: 'password',
          username,
          password,
          scope,
        },
      };

      sinon.stub(usecases, 'authenticateUser').resolves({ accessToken, refreshToken, expirationDelaySeconds });

      const tokenServiceStub = { extractUserId: sinon.stub() };
      tokenServiceStub.extractUserId.withArgs(accessToken).returns(USER_ID);

      const dependencies = { tokenService: tokenServiceStub };

      // when
      const response = await authenticationController.createToken(request, hFake, dependencies);

      // then
      const expectedResponseResult = {
        token_type: 'bearer',
        access_token: accessToken,
        user_id: USER_ID,
        refresh_token: refreshToken,
        expires_in: expirationDelaySeconds,
      };
      expect(response.source).to.deep.equal(expectedResponseResult);
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal({
        'Content-Type': 'application/json;charset=UTF-8',
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      });
    });

    context('when there is a locale cookie', function () {
      it('retrieves the value from the cookie and pass it as an argument to the use case', async function () {
        // given
        const expirationDelaySeconds = 777;
        const refreshToken = 'cookie.refresh.token';
        const localeFromCookie = 'fr-FR';
        const request = {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
          },
          payload: {
            grant_type: 'password',
            username,
            password,
            scope,
          },
          state: {
            locale: localeFromCookie,
          },
        };
        sinon.stub(usecases, 'authenticateUser').resolves({ accessToken, refreshToken, expirationDelaySeconds });
        const tokenServiceStub = { extractUserId: sinon.stub() };
        tokenServiceStub.extractUserId.withArgs(accessToken).returns(USER_ID);

        const dependencies = { tokenService: tokenServiceStub };

        // when
        await authenticationController.createToken(request, hFake, dependencies);

        // then
        expect(usecases.authenticateUser).to.have.been.calledWithExactly({
          username,
          password,
          scope,
          source,
          localeFromCookie,
        });
      });
    });
  });

  describe('#authenticateAnonymousUser', function () {
    it('should return an access token', async function () {
      // given
      const campaignCode = 'SIMPLIFIE';
      const lang = 'fr';
      const request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: { campaign_code: campaignCode, lang },
      };
      sinon.stub(usecases, 'authenticateAnonymousUser').withArgs({ campaignCode, lang }).resolves('valid access token');

      // when
      const { statusCode, source } = await authenticationController.authenticateAnonymousUser(request, hFake);

      // then
      expect(statusCode).to.equal(200);
      expect(source).to.deep.equal({ access_token: 'valid access token', token_type: 'bearer' });
    });
  });

  describe('#authenticateExternalUser', function () {
    it('should return an access token', async function () {
      // given
      const accessToken = 'jwt.access.token';
      const user = {
        username: 'saml.jackson1234',
        password: 'Pix123',
      };
      const externalUserToken = 'SamlJacksonToken';
      const expectedUserId = 1;

      const request = {
        payload: {
          data: {
            attributes: {
              username: user.username,
              password: user.password,
              'external-user-token': externalUserToken,
              'expected-user-id': expectedUserId,
            },
            type: 'external-user-authentication-requests',
          },
        },
      };

      sinon
        .stub(usecases, 'authenticateExternalUser')
        .withArgs({
          username: user.username,
          password: user.password,
          externalUserToken,
          expectedUserId,
        })
        .resolves(accessToken);

      // when
      const response = await authenticationController.authenticateExternalUser(request, hFake);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.source.data.attributes['access-token']).to.equal(accessToken);
    });
  });

  describe('#authenticateApplication', function () {
    it('should return an OAuth 2 token response', async function () {
      // given
      const access_token = 'jwt.access.token';
      const client_id = Symbol('clientId');
      const client_secret = Symbol('clientSecret');
      const scope = Symbol('scope');

      const request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: {
          grant_type: 'password',
          client_id,
          client_secret,
          scope,
        },
      };
      const tokenServiceStub = { extractUserId: sinon.stub() };
      tokenServiceStub.extractUserId.returns(client_id);

      const dependencies = { tokenService: tokenServiceStub };

      sinon
        .stub(usecases, 'authenticateApplication')
        .withArgs({ clientId: client_id, clientSecret: client_secret, scope })
        .resolves(access_token);

      // when
      const response = await authenticationController.authenticateApplication(request, hFake, dependencies);

      // then
      const expectedResponseResult = {
        token_type: 'bearer',
        access_token,
        client_id,
      };
      expect(response.source).to.deep.equal(expectedResponseResult);
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal({
        'Content-Type': 'application/json;charset=UTF-8',
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      });
    });
  });

  describe('#revokeToken', function () {
    it('should return 204', async function () {
      // given
      const token = 'jwt.refresh.token';
      const request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: {
          token,
        },
      };
      sinon.stub(usecases, 'revokeRefreshToken').resolves();

      // when
      const response = await authenticationController.revokeToken(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
      sinon.assert.calledWith(usecases.revokeRefreshToken, { refreshToken: token });
    });

    it('should return null when token hint is of type access token', async function () {
      // given
      const token = 'jwt.refresh.token';
      const request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: {
          token,
          token_type_hint: 'access_token',
        },
      };
      sinon.stub(usecases, 'revokeRefreshToken').resolves();

      // when
      const response = await authenticationController.revokeToken(request, hFake);

      // then
      expect(response).to.be.null;
    });
  });
});
