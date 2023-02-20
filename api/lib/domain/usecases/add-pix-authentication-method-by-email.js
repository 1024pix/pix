import { AuthenticationMethodAlreadyExistsError } from '../errors';
import AuthenticationMethod from '../models/AuthenticationMethod';

export default async function addPixAuthenticationMethodByEmail({
  userId,
  email,
  passwordGenerator,
  encryptionService,
  userRepository,
  authenticationMethodRepository,
}) {
  await userRepository.checkIfEmailIsAvailable(email);

  const alreadyHasPixAuthenticationMethod = await authenticationMethodRepository.hasIdentityProviderPIX({ userId });

  if (alreadyHasPixAuthenticationMethod) {
    throw new AuthenticationMethodAlreadyExistsError();
  } else {
    const generatedPassword = passwordGenerator.generateComplexPassword();
    const hashedPassword = await encryptionService.hashPassword(generatedPassword);

    const authenticationMethodFromPix = new AuthenticationMethod({
      userId,
      identityProvider: AuthenticationMethod.identityProviders.PIX,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: false,
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod: authenticationMethodFromPix });
    await userRepository.updateUserDetailsForAdministration({ id: userId, userAttributes: { email } });
    return userRepository.getUserDetailsForAdmin(userId);
  }
}
