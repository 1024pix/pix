/**
 * @param {Object} params
 * @param {string} params.userId
 * @param {userAdminRepository} userAdminRepository
 * @param {legalDocumentApiRepository} legalDocumentApiRepository
 * @throws UserNotFoundError
 * @returns {Promise<UserDetailsForAdmin>}
 */
const getUserDetailsForAdmin = async function ({ userId, userAdminRepository, legalDocumentApiRepository }) {
  const userDetailsForAdmin = await userAdminRepository.getUserDetailsForAdmin(userId);

  const pixAppTosStatus = await legalDocumentApiRepository.getPixAppTosStatus({ userId });
  const pixOrgaTosStatus = await legalDocumentApiRepository.getPixOrgaTosStatus({ userId });
  userDetailsForAdmin.setTosStatus({ pixAppTosStatus, pixOrgaTosStatus });

  return userDetailsForAdmin;
};

export { getUserDetailsForAdmin };
