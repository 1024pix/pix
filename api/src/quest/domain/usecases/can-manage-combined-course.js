export async function canManageCombinedCourse({
  userId,
  combinedCourseId,
  membershipRepository,
  combinedCourseRepository,
}) {
  const { organizationId } = await combinedCourseRepository.getById({ id: combinedCourseId });

  const memberships = await membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId,
  });

  return memberships.length > 0;
}
