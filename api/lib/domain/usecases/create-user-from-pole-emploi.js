const moment = require('moment');
const User = require('../models/User');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const authenticationCache = require('../../infrastructure/caches/authentication-cache');
const { InvalidExternalAPIResponseError } = require('../errors');
const logger = require('../../infrastructure/logger');

module.exports = async function createUserFromPoleEmploi({
  authenticationKey,
  userRepository,
  authenticationMethodRepository,
  authenticationService,
}) {
  const userCredentials = await authenticationCache.get(authenticationKey);
  const userInfo = await authenticationService.getPoleEmploiUserInfo(userCredentials.idToken);

  if (!userInfo.firstName || !userInfo.lastName || !userInfo.externalIdentityId) {
    logger.error(`Un des champs obligatoires n'a pas été renvoyé par /userinfo: ${JSON.stringify(userInfo)}.`);
    throw new InvalidExternalAPIResponseError('API PE: les informations utilisateurs récupérées sont incorrectes.');
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier: userInfo.externalIdentityId,
    identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
  });

  if (authenticationMethod) {
    return {
      userId: authenticationMethod.userId,
      idToken: userCredentials.idToken,
    };
  }

  const user = new User({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    cgu: true,
  });

  let createdUserId = null;
  await DomainTransaction.execute(async (domainTransaction) => {
    createdUserId = (await userRepository.create({ user, domainTransaction })).id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      userId: createdUserId,
      externalIdentifier: userInfo.externalIdentityId,
      authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken: userCredentials.accessToken,
        refreshToken: userCredentials.refreshToken,
        expiredDate: moment().add(userCredentials.expiresIn, 's').toDate(),
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });

  return {
    userId: createdUserId,
    idToken: userCredentials.idToken,
  };
};
