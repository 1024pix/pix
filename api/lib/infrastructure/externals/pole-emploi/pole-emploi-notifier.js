const get = require('lodash/get');
const moment = require('moment');
const querystring = require('querystring');

const authenticationMethodRepository = require('../../repositories/authentication-method-repository');
const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');
const httpAgent = require('../../http/http-agent');
const settings = require('../../../config');
const { UnexpectedUserAccount } = require('../../../domain/errors');
const logger = require('../../logger');

module.exports = {
  async notify(userId, payload) {
    const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI });
    let accessToken = get(authenticationMethod, 'authenticationComplement.accessToken');
    if (!accessToken) {
      throw new UnexpectedUserAccount({ message: 'Le compte utilisateur n\'est pas rattaché à l\'organisation Pôle Emploi' });
    }

    const expiredDate = get(authenticationMethod, 'authenticationComplement.expiredDate');
    const refreshToken = get(authenticationMethod, 'authenticationComplement.refreshToken');
    if (!refreshToken || new Date(expiredDate) <= new Date()) {
      const data = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_secret: settings.poleEmploi.clientSecret,
        client_id: settings.poleEmploi.clientId,
      };

      const tokenResponse = await httpAgent.post({
        url: settings.poleEmploi.tokenUrl,
        payload: querystring.stringify(data),
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      });

      if (!tokenResponse.isSuccessful) {
        const errorMessage = _getErrorMessage(tokenResponse.data);
        logger.error(errorMessage);
        return {
          isSuccessful: tokenResponse.isSuccessful,
          code: tokenResponse.code || '500',
        };
      }

      accessToken = tokenResponse.data['access_token'];
      const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken,
        refreshToken: tokenResponse.data['refresh_token'],
        expiredDate: moment().add(tokenResponse.data['expires_in'], 's').toDate(),
      });
      await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({ authenticationComplement, userId });
    }

    const url = settings.poleEmploi.sendingUrl;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Service-source': 'Pix',
    };

    const httpResponse = await httpAgent.post({ url, payload, headers });

    if (!httpResponse.isSuccessful) {
      const errorMessage = _getErrorMessage(httpResponse.data);
      logger.error(errorMessage);
    }

    return {
      isSuccessful: httpResponse.isSuccessful,
      code: httpResponse.code || '500',
    };
  },
};

function _getErrorMessage(data) {
  let message;

  if (typeof data === 'string') {
    message = data;
  } else {
    const error = get(data, 'error', '');
    const error_description = get(data, 'error_description', '');
    message = `${error} ${error_description}`;
  }
  return message.trim();
}
