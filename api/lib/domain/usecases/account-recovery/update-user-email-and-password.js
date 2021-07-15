const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');

const { AccountRecoveryUserAlreadyConfirmEmail } = require('../../../domain/errors');

module.exports = async function updateUserEmailAndPassword({
  userId,
  newEmail,
  password,
  userRepository,
  authenticationMethodRepository,
  encryptionService,
}) {

  // check if used has already a confirmed email
  // check if user not exist
  const userFound = await userRepository.get(userId);

  if (userFound && userFound.emailConfirmedAt) {
    throw new AccountRecoveryUserAlreadyConfirmEmail();
  }

  const authenticationMethods = await authenticationMethodRepository.findByUserId({ userId });
  // check if user has only authentication GAR then add new authentication email password method
  // check if user had only username then update password and add email
  // check if user has only email then upate password and change his email
  const hashedPassword = await encryptionService.hashPassword(password);

  const identityProvider = _tutu(authenticationMethods);

  if (identityProvider === AuthenticationMethod.identityProviders.GAR) {

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
  userRepository.save(userFound);

  function _tutu(authenticationMethods) {
    if (authenticationMethods.length === 1) {
      return authenticationMethods[0].identityProvider;
    }
  }
  // set used column to true

};
