const UserToCreate = require('../models/UserToCreate');
const { InvalidExternalAPIResponseError, AuthenticationKeyExpired } = require('../errors');
const logger = require('../../infrastructure/logger');

module.exports = async function createUserFromExternalIdp({
  identityProvider,
  authenticationKey,
  authenticationSessionService,
  authenticationServiceRegistry,
  authenticationMethodRepository,
  userToCreateRepository,
}) {
  const sessionContent = await authenticationSessionService.getByKey(authenticationKey);
  if (!sessionContent) {
    throw new AuthenticationKeyExpired();
  }
  const selectedAuthenticationService = await authenticationServiceRegistry.lookupAuthenticationService(
    identityProvider
  );
  const userInfo = await selectedAuthenticationService.getUserInfo(sessionContent);

  if (!userInfo.firstName || !userInfo.lastName || !userInfo.externalIdentityId) {
    logger.error(`Un des champs obligatoires n'a pas été renvoyé : ${JSON.stringify(userInfo)}.`);
    throw new InvalidExternalAPIResponseError('Les informations utilisateurs récupérées sont incorrectes.');
  }

  const authenticationMethod = await authenticationMethodRepository.findOneByExternalIdentifierAndIdentityProvider({
    externalIdentifier: userInfo.externalIdentityId,
    identityProvider,
  });

  if (authenticationMethod) {
    return { userId: authenticationMethod.userId };
  }

  const user = UserToCreate.createWithTermsOfServiceAccepted({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
  });

  return await selectedAuthenticationService.createUserAccount({
    user,
    sessionContent,
    externalIdentityId: userInfo.externalIdentityId,
    userToCreateRepository,
    authenticationMethodRepository,
  });
};
