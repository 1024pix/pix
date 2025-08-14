import { userOrganizationsForAdminRepository as injectedUserOrganizationsForAdminRepository } from '../../infrastructure/repositories/user-organizations-for-admin.repository.js';
const findUserOrganizationsForAdmin = async function ({
  userId,
  userOrganizationsForAdminRepository = injectedUserOrganizationsForAdminRepository,
} = {}) {
  return userOrganizationsForAdminRepository.findByUserId(userId);
};

export { findUserOrganizationsForAdmin };
