const UserToCreate = require('../../models/UserToCreate');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const { InvalidExternalAPIResponseError, AuthenticationKeyExpired } = require('../../errors');
const logger = require('../../../infrastructure/logger');

module.exports = async function createUserFromCnav({
  authenticationKey,
  authenticationSessionService,
  cnavAuthenticationService,
  authenticationMethodRepository,
  userToCreateRepository,
}) {
  const idToken = await authenticationSessionService.getByKey(authenticationKey);
  if (!idToken) {
    throw new AuthenticationKeyExpired();
  }
  const userInfo = await cnavAuthenticationService.getUserInfo(idToken);

  if (!userInfo.firstName || !userInfo.lastName || !userInfo.externalIdentityId) {
    logger.error(`Un des champs obligatoires n'a pas été renvoyé par /userinfo: ${JSON.stringify(userInfo)}.`);
    throw new InvalidExternalAPIResponseError('API CNAV: les informations utilisateurs récupérées sont incorrectes.');
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier: userInfo.externalIdentityId,
    identityProvider: AuthenticationMethod.identityProviders.CNAV,
  });

  if (authenticationMethod) {
    return authenticationMethod.userId;
  }

  const user = UserToCreate.createWithTermsOfServiceAccepted({
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
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });

  return createdUserId;
};
