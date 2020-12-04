const _ = require('lodash');
const authenticationMethodRepository = require('../../repositories/authentication-method-repository');
const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');
const httpAgent = require('../../http/http-agent');
const settings = require('../../../config');
const { UnexpectedUserAccount } = require('../../../domain/errors');

module.exports = {
  async notify(userId, payload) {
    const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({ userId, identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI });
    const accessToken = _.get(authenticationMethod, 'authenticationComplement.accessToken');
    if (!accessToken) {
      throw new UnexpectedUserAccount({ message: 'Le compte utilisateur n\'est pas rattaché à l\'organisation Pôle Emploi' });
    }
    const url = settings.poleEmploi.sendingUrl;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Service-source': 'Pix',
    };
    return httpAgent.post(url, payload, headers);
  },
};
