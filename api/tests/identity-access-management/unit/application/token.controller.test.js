import { tokenController } from '../../../../src/identity-access-management/application/token/token.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
import { RequestedApplication } from '../../../../src/identity-access-management/infrastructure/utils/network.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Application | Controller | Token', function () {
  describe('#authenticateAnonymousUser', function () {
    it('returns an access token', async function () {
      // given
      const campaignCode = 'SIMPLIFIE';
      const lang = 'fr';
      const request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'app.pix.fr',
        },
        payload: { campaign_code: campaignCode, lang },
      };
      sinon
        .stub(usecases, 'authenticateAnonymousUser')
        .withArgs({
          campaignCode,
          audience: 'https://app.pix.fr',
          lang,
        })
        .resolves('valid access token');

      // when
      const { statusCode, source } = await tokenController.authenticateAnonymousUser(request, hFake);

      // then
      expect(statusCode).to.equal(200);
      expect(source).to.deep.equal({ access_token: 'valid access token', token_type: 'bearer' });
    });
  });

  describe('#createToken', function () {
    const userId = 1;
    const accessToken = 'jwt.access.token';
    const username = 'user@email.com';
    const password = 'user_password';
    const source = 'pix';
    const audience = 'https://app.pix.fr';
    const requestedApplication = new RequestedApplication('app');

    /**
     * @see https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/
     */
    context('when the user authenticates (grant_type: password)', function () {
      it('returns an OAuth 2 token response (even if we do not really implement OAuth 2 authorization protocol)', async function () {
        // given
        const expirationDelaySeconds = 6666;
        const refreshToken = 'refresh.token';
        const locale = 'fr-FR';
        const request = {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'app.pix.fr',
          },
          payload: {
            grant_type: 'password',
            username,
            password,
          },
          state: {
            locale,
          },
        };

        sinon
          .stub(usecases, 'authenticateUser')
          .withArgs({ username, password, source, locale, audience, requestedApplication })
          .resolves({ accessToken, refreshToken, expirationDelaySeconds });

        const tokenServiceStub = { extractUserId: sinon.stub() };
        tokenServiceStub.extractUserId.withArgs(accessToken).returns(userId);

        const dependencies = { tokenService: tokenServiceStub };

        // when
        const response = await tokenController.createToken(request, hFake, dependencies);

        // then
        const expectedResponseResult = {
          token_type: 'bearer',
          access_token: accessToken,
          user_id: userId,
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
    });

    context('when the user refresh its token (grant_type: refresh_token)', function () {
      it('returns an OAuth 2 token response', async function () {
        // given
        const expirationDelaySeconds = 6666;
        const refreshToken = 'refresh.token';
        const request = {
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'x-forwarded-proto': 'https',
            'x-forwarded-host': 'app.pix.fr',
          },
          payload: { grant_type: 'refresh_token', refresh_token: refreshToken },
        };

        sinon
          .stub(usecases, 'createAccessTokenFromRefreshToken')
          .withArgs({ refreshToken, audience })
          .resolves({ accessToken, expirationDelaySeconds });

        const tokenServiceStub = { extractUserId: sinon.stub() };
        tokenServiceStub.extractUserId.withArgs(accessToken).returns(userId);

        const dependencies = { tokenService: tokenServiceStub };

        // when
        const response = await tokenController.createToken(request, hFake, dependencies);

        // then
        const expectedResponseResult = {
          token_type: 'bearer',
          access_token: accessToken,
          user_id: userId,
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
    });
  });

  describe('#revokeToken', function () {
    it('returns 204', async function () {
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
      const response = await tokenController.revokeToken(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
      sinon.assert.calledWith(usecases.revokeRefreshToken, { refreshToken: token });
    });

    it('returns null when token hint is of type access token', async function () {
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
      const response = await tokenController.revokeToken(request, hFake);

      // then
      expect(response).to.be.null;
    });
  });

  describe('#authenticateApplication', function () {
    it('returns an OAuth 2 token response', async function () {
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
      const response = await tokenController.authenticateApplication(request, hFake, dependencies);

      // then
      const expectedResponseSource = {
        token_type: 'bearer',
        access_token,
        client_id,
      };
      expect(response.source).to.deep.equal(expectedResponseSource);
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal({
        'Content-Type': 'application/json;charset=UTF-8',
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
      });
    });
  });
});
