import { BadRequestError } from '../../../shared/application/errors/http-errors.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

export async function changeUserPassword({
  userId,
  currentPassword,
  newPassword,
  authenticationMethodRepository,
  cryptoService,
}) {
  const authenticationMethod = await authenticationMethodRepository.findOneByUserIdAndIdentityProvider({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
  });

  if (!authenticationMethod) {
    throw new BadRequestError(
      'User has no Pix authentication method, password cannot be changed.',
      'USER_WITHOUT_PIX_AUTHENTICATION_METHOD',
    );
  }

  await cryptoService.assertMatchPassword({
    password: currentPassword,
    passwordHash: authenticationMethod.authenticationComplement.password,
  });

  const hashedPassword = await cryptoService.hashPassword(newPassword);

  await authenticationMethodRepository.updatePassword({ userId, hashedPassword });
}
