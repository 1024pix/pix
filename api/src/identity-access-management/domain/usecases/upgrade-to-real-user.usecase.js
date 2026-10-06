import { UnauthorizedError } from '../../../shared/application/errors/http-errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { createAccountCreationEmail } from '../emails/create-account-creation.email.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

export async function upgradeToRealUser({
  userId,
  userAttributes,
  password,
  locale,
  userRepository,
  authenticationMethodRepository,
  emailValidationDemandRepository,
  emailRepository,
  legalDocumentApiRepository,
  cryptoService,
  userService,
  userValidator,
  passwordValidator,
}) {
  const { realUser, token } = await DomainTransaction.execute(async () => {
    const user = await userRepository.get(userId);
    if (!user.isAnonymous) {
      throw new UnauthorizedError('User must be anonymous', 'NOT_ANONYMOUS_USER');
    }

    const realUser = user.convertAnonymousToRealUser(userAttributes);

    await userService.validateUserWithPasswordForCreation({
      user: realUser,
      password,
      userRepository,
      userValidator,
      passwordValidator,
    });

    await userRepository.update(realUser.mapToDatabaseDto());

    const hashedPassword = await cryptoService.hashPassword(password);
    const authenticationMethod = new AuthenticationMethod({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: false,
      }),
    });
    await authenticationMethodRepository.create({ authenticationMethod });

    await legalDocumentApiRepository.acceptPixAppTos({ userId });

    const token = await emailValidationDemandRepository.save(realUser.id);

    return { realUser, token };
  });

  await emailRepository.sendEmailAsync(
    createAccountCreationEmail({
      locale,
      email: realUser.email,
      firstName: realUser.firstName,
      token,
    }),
  );
  return realUser;
}
