export async function canManageCombinedCourse({
  userId,
  combinedCourseId,
  membershipRepository,
  combinedCourseRepository,
}) {
  const { organizationId } = await combinedCourseRepository.getById({ id: combinedCourseId });

  // bounded-context: should be called with an api from team
  const memberships = await membershipRepository.findByUserIdAndOrganizationId({
    userId,
    organizationId,
  });

  return memberships.length > 0;
}
