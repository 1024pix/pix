const jsonwebtoken = require('jsonwebtoken');
const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');

async function getUserInfo({ idToken }) {
  const { given_name, family_name, nonce, sub } = await _extractClaimsFromIdToken(idToken);

  return {
    firstName: given_name,
    lastName: family_name,
    externalIdentityId: sub,
    nonce,
  };
}

async function _extractClaimsFromIdToken(idToken) {
  const { given_name, family_name, nonce, sub } = await jsonwebtoken.decode(idToken);
  return { given_name, family_name, nonce, sub };
}

async function createUserAccount({ user, externalIdentityId, userToCreateRepository, authenticationMethodRepository }) {
  let createdUserId;
  await DomainTransaction.execute(async (domainTransaction) => {
    createdUserId = (await userToCreateRepository.create({ user, domainTransaction })).id;

    const authenticationMethod = new AuthenticationMethod({
      identityProvider: AuthenticationMethod.identityProviders.CNAV,
      userId: createdUserId,
      externalIdentifier: externalIdentityId,
    });
    await authenticationMethodRepository.create({ authenticationMethod, domainTransaction });
  });
  return { userId: createdUserId };
}

module.exports = {
  getUserInfo,
  createUserAccount,
};
