/**
 * @param {{
 *   userId: string,
 *   authenticationMethodRepository: AuthenticationMethodRepository
 * }} !params
 * @return {Promise<AuthenticationMethod[]>}
 */
export const findUserAuthenticationMethods = function ({ userId, authenticationMethodRepository }) {
  return authenticationMethodRepository.findByUserId({ userId });
};
