/**
 * @typedef {function} anonymizeGarAuthenticationMethods
 * @param {Object} params
 * @param {string} params.userIds
 * @param {AuthenticationMethodRepository} params.authenticationMethodRepository
 * @return {Promise<{anonymized: string[], total: number}>}
 */
export const anonymizeGarAuthenticationMethods = async function ({ userIds, authenticationMethodRepository }) {
  const total = userIds.length;
  const { anonymizedUserCount } = await authenticationMethodRepository.batchAnonymizeByUserIds({
    userIds,
  });
  return { anonymized: anonymizedUserCount, total };
};
