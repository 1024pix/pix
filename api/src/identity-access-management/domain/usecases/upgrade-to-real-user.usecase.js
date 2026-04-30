import { AlreadyRegisteredEmailError } from '../../../../src/shared/domain/errors.js';
import { UnauthorizedError } from '../../../shared/application/errors/http-errors.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { createAccountCreationEmail } from '../emails/create-account-creation.email.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';

const upgradeToRealUser = async function ({
  userId,
  userAttributes,
  password,
  locale,
  userRepository,
  authenticationMethodRepository,
  emailValidationDemandRepository,
  emailRepository,
  cryptoService,
}) {
  const user = await userRepository.getFullById(userId);
  if (!user.isAnonymous) {
    throw new UnauthorizedError('User must be anonymous', 'NOT_ANONYMOUS_USER');
  }

  const existingUsersWithEmail = await userRepository.findAnotherUserByEmail(userId, userAttributes.email);
  if (existingUsersWithEmail.length > 0) {
    throw new AlreadyRegisteredEmailError();
  }

  const { realUser, token } = await DomainTransaction.execute(async () => {
    const realUser = user.convertAnonymousToRealUser(userAttributes);
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
};

export { upgradeToRealUser };
