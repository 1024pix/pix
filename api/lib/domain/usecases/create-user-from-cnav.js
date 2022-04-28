const UserToCreate = require('../models/UserToCreate');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const { InvalidExternalAPIResponseError, AuthenticationKeyForCnavTokenExpired } = require('../errors');
const logger = require('../../infrastructure/logger');

module.exports = async function createUserFromCnav({
  authenticationKey,
  authenticationSessionService,
  cnavAuthenticationService,
  authenticationMethodRepository,
  userToCreateRepository,
}) {
  const cnavTokens = await authenticationSessionService.getByKey(authenticationKey);
  if (!cnavTokens) {
    // mutualiser cette erreur pour toutes les clés expirées
    // exemple : throw new AuthenticationKeyExpired();
    throw new AuthenticationKeyForCnavTokenExpired();
  }
  const userInfo = await cnavAuthenticationService.getUserInfo(cnavTokens.idToken);

  // nom et prénom nécessaires pour les afficher dans le menu de Pix App (autre raison ?)
  // Est-ce pour autant obligatoire ?
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

  // Méthode createFromCnav, à mutualiser avec PE ?
  // La méthode propose un ...user pour ajouter les paramètres que l'on souhaite
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
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });

  return {
    userId: createdUserId,
    idToken: cnavTokens.idToken,
  };
};
