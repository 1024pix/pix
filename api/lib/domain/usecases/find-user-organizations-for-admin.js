const findUserOrganizationsForAdmin = async function ({ userId, userOrganizationsForAdminRepository }) {
  return userOrganizationsForAdminRepository.findByUserId(userId);
};

export { findUserOrganizationsForAdmin };
