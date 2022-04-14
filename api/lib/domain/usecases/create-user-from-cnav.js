const moment = require('moment');
const UserToCreate = require('../models/UserToCreate');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const { InvalidExternalAPIResponseError, AuthenticationKeyForCnavTokenExpired } = require('../errors');
const logger = require('../../infrastructure/logger');

module.exports = async function createUserFromCnav({
  authenticationKey,
  authenticationMethodRepository,
  cnavTokensRepository,
  userToCreateRepository,
  authenticationService,
}) {
  const cnavTokens = await cnavTokensRepository.getByKey(authenticationKey);
  if (!cnavTokens) {
    throw new AuthenticationKeyForCnavTokenExpired();
  }
  const userInfo = await authenticationService.getCnavUserInfo(cnavTokens.idToken);

  if (!userInfo.firstName || !userInfo.lastName || !userInfo.externalIdentityId) {
    logger.error(`Un des champs obligatoires n'a pas été renvoyé par /userinfo: ${JSON.stringify(userInfo)}.`);
    throw new InvalidExternalAPIResponseError('API CNAV: les informations utilisateurs récupérées sont incorrectes.');
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier: userInfo.externalIdentityId,
    identityProvider: AuthenticationMethod.identityProviders.CNAV,
  });

  if (authenticationMethod) {
    return {
      userId: authenticationMethod.userId,
      idToken: cnavTokens.idToken,
    };
  }

  const user = UserToCreate.createFromCnav({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
  });

  let createdUserId = null;
  await DomainTransaction.execute(async (domainTransaction) => {
    createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.CNAV,
      userId: createdUserId,
      externalIdentifier: userInfo.externalIdentityId,
      authenticationComplement: new AuthenticationMethod.CnavAuthenticationComplement({
        accessToken: cnavTokens.accessToken,
        refreshToken: cnavTokens.refreshToken,
        expiredDate: moment().add(cnavTokens.expiresIn, 's').toDate(),
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });

  return {
    userId: createdUserId,
    idToken: cnavTokens.idToken,
  };
};
