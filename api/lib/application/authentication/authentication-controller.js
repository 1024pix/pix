const { featureToggles } = require('../../config');
const { BadRequestError } = require('../http-errors');

const tokenService = require('../../domain/services/token-service');
const usecases = require('../../domain/usecases');
const { livretScolaireAuthentication } = require('../../config');

const get = require('lodash/get');

module.exports = {

  /**
   * @see https://tools.ietf.org/html/rfc6749#section-4.3
   */
  async authenticateUser(request, h) {
    const { username, password, scope } = request.payload;

    const accessToken = await usecases.authenticateUser({ username, password, scope, source: 'pix' });

    return h.response({
      token_type: 'bearer',
      access_token: accessToken,
      user_id: tokenService.extractUserId(accessToken),
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

  async authenticatePoleEmploiUser(request, h) {
    if (!featureToggles.isPoleEmploiEnabled) {
      throw new BadRequestError('This feature is not enable!');
    }
    const authenticatedUserId = get(request.auth, 'credentials.userId');
    const {
      code,
      'client_id': clientId,
      'redirect_uri': redirectUri,
      'state_sent': stateSent,
      'state_received': stateReceived,
    } = request.payload;

    const response = await usecases.authenticatePoleEmploiUser({ code, clientId, redirectUri, authenticatedUserId, stateSent, stateReceived });

    return h.response(response).code(200);
  },

  async authenticateAnonymousUser(request, h) {

    const { 'campaign_code': campaignCode, lang } = request.payload;
    const accessToken = await usecases.authenticateAnonymousUser({ campaignCode, lang });

    const response = {
      token_type: 'bearer',
      access_token: accessToken,
    };

    return h.response(response).code(200);
  },

  async authenticateApplicationLivretScolaire(request, h) {
    const { client_id: clientId, client_secret: clientSecret, scope } = request.payload;

    const accessToken = await usecases.authenticateApplicationLivretScolaire({ clientId, clientSecret, scope });

    return h.response({
      token_type: 'bearer',
      access_token: accessToken,
      client_id: tokenService.extractClientId(accessToken, livretScolaireAuthentication.secret),
    })
      .code(200)
      .header('Content-Type', 'application/json;charset=UTF-8')
      .header('Cache-Control', 'no-store')
      .header('Pragma', 'no-cache');
  },

};
