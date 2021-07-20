const AuthenticationMethod = require('../../../domain/models/AuthenticationMethod');
const { AccountRecoveryUserAlreadyConfirmEmail } = require('../../../domain/errors');
const { NotFoundError } = require('../../errors');
const moment = require('moment');

module.exports = async function updateUserAccount({
  userId,
  newEmail,
  password,
  temporaryKey,
  userRepository,
  authenticationMethodRepository,
  accountRecoveryDemandRepository,
  encryptionService,
  domainTransaction,
}) {

  const { userId: foundUserId } = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
  if (foundUserId !== userId) {
    throw new NotFoundError('The temporary key is not for the provided user');
  }
  const userFound = await userRepository.get(userId);

  if (userFound && userFound.emailConfirmedAt) {
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
      userId: userFound.id,
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
      userId: userFound.id,
      hashedPassword,
    },
    domainTransaction);
  }

  userFound.cgu = true;
  userFound.email = newEmail;
  userFound.emailConfirmedAt = moment();

  const user = await userRepository.create({ user: userFound, domainTransaction });
  await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey, domainTransaction);
  return user;
};
