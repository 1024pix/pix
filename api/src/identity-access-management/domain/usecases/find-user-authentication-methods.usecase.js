import * as injectedAuthenticationMethodRepository from '../../infrastructure/repositories/authentication-method.repository.js'; /**
 * @param {{
 *   userId: string,
 *   authenticationMethodRepository: AuthenticationMethodRepository
 * }} !params
 * @return {Promise<AuthenticationMethod[]>}
 */
export const findUserAuthenticationMethods = function ({
  userId,
  authenticationMethodRepository = injectedAuthenticationMethodRepository,
} = {}) {
  return authenticationMethodRepository.findByUserId({ userId });
};
