const { sinon, expect, catchErr, hFake } = require('../../../test-helper');
const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const PoleEmploiTokens = require('../../../../lib/domain/models/PoleEmploiTokens');

const { UnauthorizedError } = require('../../../../lib/application/http-errors');

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

      sinon
        .stub(usecases, 'authenticateUser')
        .withArgs({ username, password, scope, source })
        .resolves({ accessToken, refreshToken });
      sinon.stub(tokenService, 'extractUserId').returns(USER_ID);

      // when
      const response = await authenticationController.createToken(request, hFake);

      // then
      const expectedResponseResult = {
        token_type: 'bearer',
        access_token: accessToken,
        user_id: USER_ID,
        refresh_token: refreshToken,
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

  describe('#authenticatePoleEmploiUser', function () {
    const code = 'ABCD';
    const client_id = 'CLIENT_ID';
    const redirect_uri = 'http://redirectUri.fr';
    const state_sent = 'state';
    const state_received = 'state';

    const pixAccessToken = 'pixAccessToken';
    const poleEmploiTokens = new PoleEmploiTokens({
      accessToken: 'poleEmploiAccessToken',
      expiresIn: 60,
      idToken: 'idToken',
      refreshToken: 'refreshToken',
    });

    let request;

    beforeEach(function () {
      request = {
        payload: {
          code,
          client_id,
          redirect_uri,
          state_sent,
          state_received,
        },
      };

      sinon.stub(usecases, 'authenticatePoleEmploiUser');
    });

    it('should call usecase with payload parameters', async function () {
      // given
      usecases.authenticatePoleEmploiUser.resolves({ pixAccessToken, poleEmploiTokens });
      const expectedParameters = {
        authenticatedUserId: undefined,
        clientId: client_id,
        code,
        redirectUri: redirect_uri,
        stateReceived: state_received,
        stateSent: state_sent,
      };

      // when
      await authenticationController.authenticatePoleEmploiUser(request, hFake);

      // then
      expect(usecases.authenticatePoleEmploiUser).to.have.been.calledWith(expectedParameters);
    });

    it('should return PIX access token and Pole emploi ID token', async function () {
      // given
      usecases.authenticatePoleEmploiUser.resolves({ pixAccessToken, poleEmploiTokens });
      const expectedResult = {
        access_token: pixAccessToken,
        id_token: poleEmploiTokens.idToken,
      };

      // when
      const response = await authenticationController.authenticatePoleEmploiUser(request, hFake);

      // then
      expect(response).to.deep.equal(expectedResult);
    });

    it('should return UnauthorizedError if pixAccessToken is not exist', async function () {
      // given
      const authenticationKey = 'aaa-bbb-ccc';
      usecases.authenticatePoleEmploiUser.resolves({ authenticationKey });
      const expectedErrorMessage = "L'utilisateur n'a pas de compte Pix";
      const expectedResponseCode = 'SHOULD_VALIDATE_CGU';
      const expectedMeta = { authenticationKey };

      // when
      const error = await catchErr(authenticationController.authenticatePoleEmploiUser)(request, hFake);

      // then
      expect(error).to.be.an.instanceOf(UnauthorizedError);
      expect(error.message).to.equal(expectedErrorMessage);
      expect(error.code).to.equal(expectedResponseCode);
      expect(error.meta).to.deep.equal(expectedMeta);
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
      sinon.stub(tokenService, 'extractClientId').returns(client_id);
      sinon
        .stub(usecases, 'authenticateApplication')
        .withArgs({ clientId: client_id, clientSecret: client_secret, scope })
        .resolves(access_token);

      // when
      const response = await authenticationController.authenticateApplication(request, hFake);

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
      sinon.stub(usecases, 'revokeRefreshToken').withArgs({ refreshToken: token }).resolves();

      // when
      const response = await authenticationController.revokeToken(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
