const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');
const { AccountRecoveryUserAlreadyConfirmEmail } = require('../../../domain/errors');

module.exports = async function updateUserAccount({
  password,
  temporaryKey,
  userRepository,
  authenticationMethodRepository,
  accountRecoveryDemandRepository,
  encryptionService,
  domainTransaction,
}) {

  const { userId, newEmail } = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  const user = await userRepository.get(userId);

  if (user && user.emailConfirmedAt) {
    throw new AccountRecoveryUserAlreadyConfirmEmail();
  }

  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });
  const isAuthenticatedFromGarOnly = (
    authenticationMethods.length === 1 &&
    authenticationMethods[0].identityProvider === AuthenticationMethod.identityProviders.GAR
  );

  const hashedPassword = await encryptionService.hashPassword(password);

  if (isAuthenticatedFromGarOnly) {
    const authenticationMethodFromPix = new AuthenticationMethod({
      userId,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: false,
      }),
    });
    authenticationMethodRepository.create({
      authenticationMethod: authenticationMethodFromPix,
    },
    domainTransaction);
  } else {
    authenticationMethodRepository.updateChangedPassword({
      userId,
      hashedPassword,
    },
    domainTransaction);
  }

  const userValuesToUpdate = { cgu: true, email: newEmail, emailConfirmedAt: new Date() };

  await userRepository.updateWithEmailConfirmed({
    id: userId,
    userAttributes: userValuesToUpdate,
    domainTransaction,
  });
  await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey, domainTransaction);
};
