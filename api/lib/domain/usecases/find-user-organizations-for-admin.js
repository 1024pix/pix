export default async function findUserOrganizationsForAdmin({ userId, userOrganizationsForAdminRepository }) {
  return userOrganizationsForAdminRepository.findByUserId(userId);
}
