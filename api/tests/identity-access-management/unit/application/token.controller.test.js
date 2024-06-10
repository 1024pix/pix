import { tokenController } from '../../../../src/identity-access-management/application/token/token.controller.js';
import { usecases } from '../../../../src/identity-access-management/domain/usecases/index.js';
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
        },
        payload: { campaign_code: campaignCode, lang },
      };
      sinon.stub(usecases, 'authenticateAnonymousUser').resolves('valid access token');

      // when
      const { statusCode, source } = await tokenController.authenticateAnonymousUser(request, hFake);

      // then
      expect(statusCode).to.equal(200);
      expect(source).to.deep.equal({ access_token: 'valid access token', token_type: 'bearer' });
      expect(usecases.authenticateAnonymousUser).to.have.been.calledWithExactly({ campaignCode, lang });
    });
  });

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
    it('returns an OAuth 2 token response (even if we do not really implement OAuth 2 authorization protocol)', async function () {
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
      const response = await tokenController.createToken(request, hFake, dependencies);

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
        await tokenController.createToken(request, hFake, dependencies);

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
});
