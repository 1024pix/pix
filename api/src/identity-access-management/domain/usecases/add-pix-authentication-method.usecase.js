import { AuthenticationMethodAlreadyExistsError } from '../../../shared/domain/errors.js';
import { cryptoService as injectedCryptoService } from '../../../shared/domain/services/crypto-service.js';
import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js';
import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../constants/identity-providers.js';
import { AuthenticationMethod } from '../models/AuthenticationMethod.js';
import * as injectedPasswordGeneratorService from '../services/password-generator.service.js';

/**
 * Adds a PIX authentication method for a user.
 *
 * @param {Object} params - The parameters for adding the authentication method.
 * @param {string} params.userId - The ID of the user.
 * @param {string} params.email - The email of the user.
 * @throws {AuthenticationMethodAlreadyExistsError} If the user already has a PIX authentication method.
 * @returns {Promise<Object>} The updated user details.
 */
const addPixAuthenticationMethod = async function ({
  userId,
  email,
  cryptoService = injectedCryptoService,
  passwordGeneratorService = injectedPasswordGeneratorService,
  userRepository = injectedUserRepository,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
} = {}) {
  await userRepository.checkIfEmailIsAvailable(email);

  const alreadyHasPixAuthenticationMethod = await authenticationMethodRepository.hasIdentityProviderPIX({ userId });
  if (alreadyHasPixAuthenticationMethod) throw new AuthenticationMethodAlreadyExistsError();

  const generatedPassword = passwordGeneratorService.generateComplexPassword();
  const hashedPassword = await cryptoService.hashPassword(generatedPassword);

  const authenticationMethodFromPix = new AuthenticationMethod({
    userId,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    }),
  });
  await authenticationMethodRepository.create({ authenticationMethod: authenticationMethodFromPix });
  await userRepository.updateUserDetailsForAdministration({ id: userId, userAttributes: { email } });
  return userRepository.getUserDetailsForAdmin(userId);
};

export { addPixAuthenticationMethod };
