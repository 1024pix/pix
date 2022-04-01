const moment = require('moment');
const UserToCreate = require('../models/UserToCreate');
const AuthenticationMethod = require('../models/AuthenticationMethod');
const DomainTransaction = require('../../infrastructure/DomainTransaction');
const { InvalidExternalAPIResponseError, AuthenticationKeyForPoleEmploiTokenExpired } = require('../errors');
const logger = require('../../infrastructure/logger');

module.exports = async function createUserFromPoleEmploi({
  authenticationKey,
  authenticationMethodRepository,
  poleEmploiTokensRepository,
  userToCreateRepository,
  authenticationService,
}) {
  const poleEmploiTokens = await poleEmploiTokensRepository.getByKey(authenticationKey);
  if (!poleEmploiTokens) {
    throw new AuthenticationKeyForPoleEmploiTokenExpired();
  }
  const userInfo = await authenticationService.getPoleEmploiUserInfo(poleEmploiTokens.idToken);

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
      idToken: poleEmploiTokens.idToken,
    };
  }

  const user = UserToCreate.createFromPoleEmploi({
    firstName: userInfo.firstName,
    lastName: userInfo.lastName,
  });

  let createdUserId = null;
  await DomainTransaction.execute(async (domainTransaction) => {
    createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      userId: createdUserId,
      externalIdentifier: userInfo.externalIdentityId,
      authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken: poleEmploiTokens.accessToken,
        refreshToken: poleEmploiTokens.refreshToken,
        expiredDate: moment().add(poleEmploiTokens.expiresIn, 's').toDate(),
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });

  return {
    userId: createdUserId,
    idToken: poleEmploiTokens.idToken,
  };
};
