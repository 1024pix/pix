/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {UserRepository} userRepository
 * @throws UserNotFoundError
 * @returns {Promise<UserDetailsForAdmin>}
 */
const getUserDetailsForAdmin = async function ({ userId, userRepository, legalDocumentApiRepository }) {
  const userDetailsForAdmin = await userRepository.getUserDetailsForAdmin(userId);

  const pixAppTosStatus = await legalDocumentApiRepository.getPixAppTosStatus({ userId });
  const pixOrgaTosStatus = await legalDocumentApiRepository.getPixOrgaTosStatus({ userId });
  userDetailsForAdmin.setTosStatus({ pixAppTosStatus, pixOrgaTosStatus });

  return userDetailsForAdmin;
};

export { getUserDetailsForAdmin };
