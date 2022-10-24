const get = require('lodash/get');
const moment = require('moment');
const querystring = require('querystring');
const monitoringTools = require('../../monitoring-tools');
const authenticationMethodRepository = require('../../repositories/authentication-method-repository');
const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');
const OidcIdentityProviders = require('../../../domain/constants/oidc-identity-providers');
const httpAgent = require('../../http/http-agent');
const settings = require('../../../config');
const { UnexpectedUserAccountError } = require('../../../domain/errors');

module.exports = {
  async notify(userId, payload) {
    monitoringTools.logInfo({
      event: 'participation-send-pole-emploi',
      'pole-emploi-action': 'send-results',
      'participation-state': participationState(payload),
    });
    const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
      userId,
      identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
    });
    let accessToken = get(authenticationMethod, 'authenticationComplement.accessToken');
    if (!accessToken) {
      throw new UnexpectedUserAccountError({
        message: "Le compte utilisateur n'est pas rattaché à l'organisation Pôle Emploi",
      });
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
        monitoringTools.logError({
          event: 'participation-send-pole-emploi',
          'pole-emploi-action': 'refresh-token',
          'participation-state': participationState(payload),
          message: errorMessage,
        });
        return {
          isSuccessful: tokenResponse.isSuccessful,
          code: tokenResponse.code || '500',
        };
      }

      accessToken = tokenResponse.data['access_token'];
      const authenticationComplement = new AuthenticationMethod.OidcAuthenticationComplement({
        accessToken,
        refreshToken: tokenResponse.data['refresh_token'],
        expiredDate: moment().add(tokenResponse.data['expires_in'], 's').toDate(),
      });
      await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
        authenticationComplement,
        userId,
        identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
      });
    }

    const url = settings.poleEmploi.sendingUrl;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/json',
      Accept: 'application/json',
      'Service-source': 'Pix',
    };

    const httpResponse = await httpAgent.post({ url, payload, headers });

    if (!httpResponse.isSuccessful) {
      const errorMessage = _getErrorMessage(httpResponse.data);
      monitoringTools.logError({
        event: 'participation-send-pole-emploi',
        'pole-emploi-action': 'send-results',
        'participation-state': participationState(payload),
        message: errorMessage,
      });
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

function participationState(payload) {
  if (payload.dateValidation) {
    return 'PARTICIPATION_SHARED';
  } else if (payload.progression === 100) {
    return 'PARTICIPATION_COMPLETED';
  } else {
    return 'PARTICIPATION_STARTED';
  }
}
