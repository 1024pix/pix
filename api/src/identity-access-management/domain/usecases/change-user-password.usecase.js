import {
  InvalidPasswordForUpdateEmailError,
  PasswordNotMatching,
  UserNotAuthorizedToUpdatePasswordError,
} from '../../../shared/domain/errors.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';

const changeUserPassword = async function ({
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
    throw new UserNotAuthorizedToUpdatePasswordError();
  }

  try {
    await cryptoService.assertMatchPassword({
      password: currentPassword,
      passwordHash: authenticationMethod.authenticationComplement.password,
    });
  } catch (error) {
    if (error instanceof PasswordNotMatching) {
      throw new InvalidPasswordForUpdateEmailError();
    }
    throw error;
  }

  const hashedPassword = await cryptoService.hashPassword(newPassword);

  await authenticationMethodRepository.updatePassword({ userId, hashedPassword });
};

export { changeUserPassword };
