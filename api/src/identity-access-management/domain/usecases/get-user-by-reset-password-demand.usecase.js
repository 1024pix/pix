/**
 * @typedef {function} getUserByResetPasswordDemandUseCase
 * @param {Object} params
 * @param {string} params.temporaryKey
 * @param {ResetPasswordService} params.resetPasswordService
 * @param {TokenService} params.tokenService
 * @param {UserRepository} params.userRepository
 * @param {resetPasswordDemandRepository} params.resetPasswordDemandRepository
 * @returns {Promise<User|UserNotFoundError>}
 */
export const getUserByResetPasswordDemand = async function ({
  temporaryKey,
  resetPasswordService,
  tokenService,
  userRepository,
  resetPasswordDemandRepository,
}) {
  await tokenService.decodeIfValid(temporaryKey);
  const { email } = await resetPasswordService.verifyDemand(temporaryKey, resetPasswordDemandRepository);
  return userRepository.getByEmail(email);
};
