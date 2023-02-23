const get = require('lodash/get');
const moment = require('moment');
const querystring = require('querystring');
const monitoringTools = require('../../monitoring-tools.js');
const authenticationMethodRepository = require('../../repositories/authentication-method-repository.js');
const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod.js');
const OidcIdentityProviders = require('../../../domain/constants/oidc-identity-providers.js');
const httpAgent = require('../../http/http-agent.js');
const settings = require('../../../config.js');
const { UnexpectedUserAccountError } = require('../../../domain/errors.js');
const httpErrorsHelper = require('../../../infrastructure/http/errors-helper.js');

module.exports = {
  async notify(userId, payload) {
    monitoringTools.logInfoWithCorrelationIds({
      event: 'participation-send-pole-emploi',
      'pole-emploi-action': 'send-results',
      'participation-state': participationState(payload),
    });
    const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
      userId,
      identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
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
      monitoringTools.logInfoWithCorrelationIds({
        event: 'participation-send-pole-emploi',
        'pole-emploi-action': 'refresh-token',
        'participation-state': participationState(payload),
        'expired-date': expiredDate,
      });
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
        timeout: settings.partner.fetchTimeOut,
      });

      if (!tokenResponse.isSuccessful) {
        const serializedError = httpErrorsHelper.serializeHttpErrorResponse(tokenResponse);
        monitoringTools.logErrorWithCorrelationIds({
          event: 'participation-send-pole-emploi',
          'pole-emploi-action': 'refresh-token',
          'participation-state': participationState(payload),
          message: serializedError,
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
        identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
      });
    }

    const url = settings.poleEmploi.sendingUrl;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-type': 'application/json',
      Accept: 'application/json',
      'Service-source': 'Pix',
    };

    const httpResponse = await httpAgent.post({
      url,
      payload,
      headers,
      timeout: settings.partner.fetchTimeOut,
    });

    if (!httpResponse.isSuccessful) {
      const serializedError = httpErrorsHelper.serializeHttpErrorResponse(httpResponse);
      monitoringTools.logErrorWithCorrelationIds({
        event: 'participation-send-pole-emploi',
        'pole-emploi-action': 'send-results',
        'participation-state': participationState(payload),
        message: serializedError,
      });
    }

    return {
      isSuccessful: httpResponse.isSuccessful,
      code: httpResponse.code || '500',
    };
  },
};

function participationState({ test }) {
  if (test.dateValidation) {
    return 'PARTICIPATION_SHARED';
  } else if (test.progression === 100) {
    return 'PARTICIPATION_COMPLETED';
  } else {
    return 'PARTICIPATION_STARTED';
  }
}
