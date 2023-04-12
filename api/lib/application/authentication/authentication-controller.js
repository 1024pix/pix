const { BadRequestError } = require('../http-errors.js');
const tokenService = require('../../domain/services/token-service.js');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  /**
   * @see https://tools.ietf.org/html/rfc6749#section-4.3
   */
  async createToken(request, h, dependencies = { tokenService }) {
    let accessToken, refreshToken;
    let expirationDelaySeconds;

    if (request.payload.grant_type === 'refresh_token') {
      refreshToken = request.payload.refresh_token;
      const accessTokenAndExpirationDelaySeconds = await usecases.createAccessTokenFromRefreshToken({ refreshToken });
      accessToken = accessTokenAndExpirationDelaySeconds.accessToken;
      expirationDelaySeconds = accessTokenAndExpirationDelaySeconds.expirationDelaySeconds;
    } else if (request.payload.grant_type === 'password') {
      const { username, password, scope } = request.payload;
      const localeFromCookie = request.state?.locale;

      const source = 'pix';
      const tokensAndExpirationDelaySeconds = await usecases.authenticateUser({
        username,
        password,
        scope,
        source,
        localeFromCookie,
      });
      accessToken = tokensAndExpirationDelaySeconds.accessToken;
      refreshToken = tokensAndExpirationDelaySeconds.refreshToken;
      expirationDelaySeconds = tokensAndExpirationDelaySeconds.expirationDelaySeconds;
    } else {
      throw new BadRequestError('Invalid grant type');
    }

    return h
      .response({
        token_type: 'bearer',
        access_token: accessToken,
        user_id: dependencies.tokenService.extractUserId(accessToken),
        refresh_token: refreshToken,
        expires_in: expirationDelaySeconds,
      })
      .code(200)
      .header('Content-Type', 'application/json;charset=UTF-8')
      .header('Cache-Control', 'no-store')
      .header('Pragma', 'no-cache');
  },

  async authenticateExternalUser(request, h) {
    const {
      username,
      password,
      'external-user-token': externalUserToken,
      'expected-user-id': expectedUserId,
    } = request.payload.data.attributes;

    const accessToken = await usecases.authenticateExternalUser({
      username,
      password,
      externalUserToken,
      expectedUserId,
    });

    const response = {
      data: {
        attributes: {
          'access-token': accessToken,
        },
        type: 'external-user-authentication-requests',
      },
    };
    return h.response(response).code(200);
  },

  async authenticateAnonymousUser(request, h) {
    const { campaign_code: campaignCode, lang } = request.payload;
    const accessToken = await usecases.authenticateAnonymousUser({ campaignCode, lang });

    const response = {
      token_type: 'bearer',
      access_token: accessToken,
    };

    return h.response(response).code(200);
  },

  async authenticateApplication(request, h) {
    const { client_id: clientId, client_secret: clientSecret, scope } = request.payload;

    const accessToken = await usecases.authenticateApplication({ clientId, clientSecret, scope });

    return h
      .response({
        token_type: 'bearer',
        access_token: accessToken,
        client_id: clientId,
      })
      .code(200)
      .header('Content-Type', 'application/json;charset=UTF-8')
      .header('Cache-Control', 'no-store')
      .header('Pragma', 'no-cache');
  },

  async revokeToken(request, h) {
    if (request.payload.token_type_hint === 'access_token') return null;

    await usecases.revokeRefreshToken({ refreshToken: request.payload.token });
    return h.response().code(204);
  },
};
