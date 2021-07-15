const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');

const { AccountRecoveryUserAlreadyConfirmEmail } = require('../../../domain/errors');

module.exports = async function updateUserEmailAndPassword({
  userId,
  newEmail,
  password,
  temporaryKey,
  userRepository,
  authenticationMethodRepository,
  accountRecoveryDemandRepository,
  encryptionService,
}) {

  // check if used has already a confirmed email
  // check if user not exist
  const userFound = await userRepository.get(userId);

  if (userFound && userFound.emailConfirmedAt) {
    throw new AccountRecoveryUserAlreadyConfirmEmail();
  }

  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });
  const isAuthenticatedFromGarOnly = (authenticationMethods.length === 1 &&
    authenticationMethods[0].identityProvider === AuthenticationMethod.identityProviders.GAR);

  const hashedPassword = await encryptionService.hashPassword(password);

  if (isAuthenticatedFromGarOnly) {
    const authenticationMethodFromPix = new AuthenticationMethod({
      userId: userFound.id,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: false,
      }),
    });
    authenticationMethodRepository.create({ authenticationMethod: authenticationMethodFromPix });
  } else {
    authenticationMethodRepository.updateChangedPassword({ userId: userFound.id, hashedPassword });
  }
  // set cgu to true
  // set email confirmed At
  userFound.cgu = true;
  userFound.email = newEmail;
  userFound.emailConfirmedAt = Date.now();

  const userUpdate = userRepository.save(userFound);

  // set used column to true
  accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey);
  return userUpdate;
};
