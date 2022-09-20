module.exports = async function findUserOrganizationsForAdmin({ userId, userOrganizationsForAdminRepository }) {
  return userOrganizationsForAdminRepository.findByUserId(userId);
};
