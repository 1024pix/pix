const DomainTransaction = require('../../../infrastructure/DomainTransaction');
const AuthenticationMethod = require('../../models/AuthenticationMethod');

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
  createUserAccount,
};
