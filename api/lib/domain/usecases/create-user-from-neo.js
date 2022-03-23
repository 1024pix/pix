const moment = require('moment');
const User = require('../models/User');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const { InvalidExternalAPIResponseError, AuthenticationKeyForNeoTokenExpired } = require('../errors');
const logger = require('../../infrastructure/logger');

module.exports = async function createUserFromNeo({
  authenticationKey,
  authenticationMethodRepository,
  neoTokensRepository,
  userRepository,
  authenticationService,
}) {
  const neoTokens = await neoTokensRepository.getByKey(authenticationKey);
  if (!neoTokens) {
    throw new AuthenticationKeyForNeoTokenExpired();
  }
  const userInfo = await authenticationService.getNeoUserInfo(neoTokens.accessToken);

  if (!userInfo.firstName || !userInfo.lastName || !userInfo.externalIdentityId) {
    logger.error(`Un des champs obligatoires n'a pas été renvoyé par /userinfo: ${JSON.stringify(userInfo)}.`);
    throw new InvalidExternalAPIResponseError('API PE: les informations utilisateurs récupérées sont incorrectes.');
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier: userInfo.externalIdentityId,
    identityProvider: AuthenticationMethod.identityProviders.NEO,
  });

  if (authenticationMethod) {
    return {
      userId: authenticationMethod.userId,
      // idToken: neoTokens.idToken,
    };
  }

  const user = new User({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
    cgu: true,
    lastTermsOfServiceValidatedAt: new Date(),
  });

  let createdUserId = null;
  await DomainTransaction.execute(async (domainTransaction) => {
    const createdUser = await userRepository.create({ user, domainTransaction });
    
    createdUserId = createdUser.id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.NEO,
      userId: createdUserId,
      externalIdentifier: userInfo.externalIdentityId,
      authenticationComplement: new AuthenticationMethod.NeoAuthenticationComplement({
        accessToken: neoTokens.accessToken,
        refreshToken: neoTokens.refreshToken,
        expiredDate: moment().add(neoTokens.expiresIn, 's').toDate(),
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });

  return {
    userId: createdUserId,
  };
};
