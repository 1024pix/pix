const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');

const { AccountRecoveryUserAlreadyConfirmEmail } = require('../../../domain/errors');

module.exports = async function updateUserEmailAndPassword({
  userId,
  password,
  userRepository,
  authenticationMethodRepository,
}) {

  // check if used has already a confirmed email
  // check if user not exist
  const userFound = await userRepository.get(userId);

  if (userFound && userFound.emailConfirmedAt) {
    throw new AccountRecoveryUserAlreadyConfirmEmail();
  }

  const authenticationMethods = authenticationMethodRepository.get(userId);
  // check if user has only authentication GAR then add new authentication email password method
  // check if user had only username then update password and add email
  // check if user has only email then upate password and change his email
  const authenticationMethodFromPix = new AuthenticationMethod({
    userId: userFound.id,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password,
      shouldChangePassword: false,
    }),
  });
  authenticationMethodRepository.create(authenticationMethodFromPix);
  // set cgu to true
  // set email confirmed At
  // userFound.cgu = true;
  // userFound.emailConfirmedAt = Date.now();
  // userRepository.save(userFound);

  // set used column to true

};
