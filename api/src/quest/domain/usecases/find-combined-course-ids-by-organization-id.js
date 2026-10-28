export const findCombinedCourseIdsByOrganizationId = async ({ combinedCourseRepository, organizationId }) => {
  return combinedCourseRepository.findCombinedCourseIdsByOrganizationId({ organizationId });
};
