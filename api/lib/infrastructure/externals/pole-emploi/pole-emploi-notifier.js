import lodash from 'lodash';

const { get } = lodash;

import querystring from 'node:querystring';

import dayjs from 'dayjs';

import * as OidcIdentityProviders from '../../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { AuthenticationMethod } from '../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { config } from '../../../../src/shared/config.js';
import { UnexpectedUserAccountError } from '../../../../src/shared/domain/errors.js';

const notify = async (userId, payload, dependencies) => {
  const { authenticationMethodRepository, httpAgent, httpErrorsHelper, logger } = dependencies;
  if (config.featureToggles.deprecatePoleEmploiPushNotification) {
    payload = { ...payload, deprecated: true };
  }

  logger.info(
    buildPayload({
      payload,
      extraParams: {
        'pole-emploi-action': 'send-results',
      },
    }),
  );

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
    logger.info(
      buildPayload({
        payload,
        extraParams: {
          'pole-emploi-action': 'refresh-token',
          'expired-date': expiredDate,
        },
      }),
    );

    const data = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_secret: config.poleEmploi.clientSecret,
      client_id: config.poleEmploi.clientId,
    };

    const tokenResponse = await httpAgent.post({
      url: config.poleEmploi.tokenUrl,
      payload: querystring.stringify(data),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      timeout: config.partner.fetchTimeOut,
    });

    if (!tokenResponse.isSuccessful) {
      logger.error(
        buildPayload({
          payload,
          extraParams: {
            'pole-emploi-action': 'refresh-token',
            message: httpErrorsHelper.serializeHttpErrorResponse(tokenResponse),
          },
        }),
      );

      return {
        isSuccessful: tokenResponse.isSuccessful,
        code: tokenResponse.code || '500',
      };
    }

    accessToken = tokenResponse.data['access_token'];
    const tokenExpiredDate = tokenResponse.data['expires_in'];
    const authenticationComplement = new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
      accessToken,
      refreshToken: tokenResponse.data['refresh_token'],
      expiredDate: tokenExpiredDate ? dayjs().add(tokenExpiredDate, 's').toDate() : new Date(),
    });
    await authenticationMethodRepository.updateAuthenticationComplementByUserIdAndIdentityProvider({
      authenticationComplement,
      userId,
      identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
    });
  }

  const url = config.poleEmploi.sendingUrl;
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
    timeout: config.partner.fetchTimeOut,
  });

  if (!httpResponse.isSuccessful) {
    logger.error(
      buildPayload({
        payload,
        extraParams: {
          'pole-emploi-action': 'send-results',
          message: httpErrorsHelper.serializeHttpErrorResponse(httpResponse),
        },
        pushInfo: false,
      }),
    );
  }

  return {
    isSuccessful: httpResponse.isSuccessful,
    code: httpResponse.code || '500',
  };
};

export { notify };

function buildPayload({ payload, extraParams }) {
  return {
    event: 'participation-send-pole-emploi',
    'participation-state': participationState(payload),
    'participation-id': payload.test.referenceExterne,
    ...extraParams,
  };
}

function participationState({ test }) {
  if (test.dateValidation) {
    return 'PARTICIPATION_SHARED';
  } else if (test.progression === 100) {
    return 'PARTICIPATION_COMPLETED';
  } else {
    return 'PARTICIPATION_STARTED';
  }
}
