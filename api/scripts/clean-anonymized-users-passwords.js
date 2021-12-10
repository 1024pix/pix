const bluebird = require('bluebird');

const authenticationMethodRepository = require('../lib/infrastructure/repositories/authentication-method-repository');
const AuthenticationMethod = require('../lib/domain/models/AuthenticationMethod');

async function cleanAnonymizedUsersPasswords({ arrayOfAnonymizedUsersIds }) {
  const anonymizedUserIdsWithPasswordDeleted = [];
  await bluebird.mapSeries(arrayOfAnonymizedUsersIds, async (userId) => {
    const numberOfRowDeleted = await authenticationMethodRepository.removeByUserIdAndIdentityProvider({
      userId,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
    });
    if (numberOfRowDeleted > 0) {
      anonymizedUserIdsWithPasswordDeleted.push(userId);
    }
  });
  return anonymizedUserIdsWithPasswordDeleted;
}

module.exports = { cleanAnonymizedUsersPasswords };
