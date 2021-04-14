const _ = require('lodash');
const authenticationMethodRepository = require('../../repositories/authentication-method-repository');
const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');
const httpAgent = require('../../http/http-agent');
const settings = require('../../../config');
const querystring = require('querystring');
const { UnexpectedUserAccount } = require('../../../domain/errors');
const moment = require('moment');
const DomainTransaction = require('../../DomainTransaction');

module.exports = {

  async notify({ userId, payload, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
      userId,
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      domainTransaction,
    });

    let accessToken = _.get(authenticationMethod, 'authenticationComplement.accessToken');
    if (!accessToken) {
      throw new UnexpectedUserAccount({ message: 'Le compte utilisateur n\'est pas rattaché à l\'organisation Pôle Emploi' });
    }

    const expiredDate = _.get(authenticationMethod, 'authenticationComplement.expiredDate');
    const refreshToken = _.get(authenticationMethod, 'authenticationComplement.refreshToken');
    if (!refreshToken || new Date(expiredDate) <= new Date()) {
      const data = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_secret: settings.poleEmploi.clientSecret,
        client_id: settings.poleEmploi.clientId,
      };

      const tokenResponse = await httpAgent.post(
        settings.poleEmploi.tokenUrl,
        querystring.stringify(data),
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        },
      );

      if (!tokenResponse.isSuccessful) {
        return {
          isSuccessful: tokenResponse.isSuccessful,
          code: tokenResponse.code,
        };
      }

      accessToken = tokenResponse.data['access_token'];
      const authenticationComplement = new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken,
        refreshToken: tokenResponse.data['refresh_token'],
        expiredDate: moment().add(tokenResponse.data['expires_in'], 's').toDate(),
      });
      await authenticationMethodRepository.updatePoleEmploiAuthenticationComplementByUserId({
        authenticationComplement,
        userId,
        domainTransaction,
      });
    }

    const url = settings.poleEmploi.sendingUrl;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Service-source': 'Pix',
    };
    const httpResponse = await httpAgent.post(url, payload, headers);

    return {
      isSuccessful: httpResponse.isSuccessful,
      code: httpResponse.code,
    };
  },
};
