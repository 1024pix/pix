const { v4: uuidv4 } = require('uuid');
const jsonwebtoken = require('jsonwebtoken');
const moment = require('moment');
const AuthenticationMethod = require('../../models/AuthenticationMethod');
const settings = require('../../../config');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const logoutUrlTemporaryStorage = require('../../../infrastructure/temporary-storage').withPrefix('logout-url:');

async function _extractClaimsFromIdToken(idToken) {
  const { given_name, family_name, nonce, sub } = await jsonwebtoken.decode(idToken);
  return { given_name, family_name, nonce, sub };
}

async function getRedirectLogoutUrl({ userId, logoutUrlUUID }) {
  const redirectTarget = new URL(settings.poleEmploi.logoutUrl);
  const key = `${userId}:${logoutUrlUUID}`;
  const idToken = await logoutUrlTemporaryStorage.get(key);
  const params = [
    { key: 'id_token_hint', value: idToken },
    { key: 'redirect_uri', value: settings.poleEmploi.afterLogoutUrl },
  ];

  params.forEach(({ key, value }) => redirectTarget.searchParams.append(key, value));

  await logoutUrlTemporaryStorage.delete(key);

  return redirectTarget.toString();
}

async function getUserInfo({ idToken }) {
  const { given_name, family_name, nonce, sub } = await _extractClaimsFromIdToken(idToken);

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: sub,
    nonce,
  };
}

async function createUserAccount({
  user,
  sessionContent,
  externalIdentityId,
  userToCreateRepository,
  authenticationMethodRepository,
}) {
  let createdUserId;
  await DomainTransaction.execute(async (domainTransaction) => {
    createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
      userId: createdUserId,
      externalIdentifier: externalIdentityId,
      authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
        accessToken: sessionContent.accessToken,
        refreshToken: sessionContent.refreshToken,
        expiredDate: moment().add(sessionContent.expiresIn, 's').toDate(),
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });
  return {
    userId: createdUserId,
    idToken: sessionContent.idToken,
  };
}

async function saveIdToken({ idToken, userId }) {
  const uuid = uuidv4();
  const { idTokenLifespanMs } = settings.poleEmploi.temporaryStorage;

  await logoutUrlTemporaryStorage.save({
    key: `${userId}:${uuid}`,
    value: idToken,
    expirationDelaySeconds: idTokenLifespanMs / 1000,
  });

  return uuid;
}

module.exports = {
  getRedirectLogoutUrl,
  getUserInfo,
  createUserAccount,
  saveIdToken,
};
