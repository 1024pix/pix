export async function isParticipationOnCombinedCourse({
  combinedCourseId,
  participationId,
  organizationLearnerParticipationRepository,
}) {
  return await organizationLearnerParticipationRepository.isParticipationOnCombinedCourse({
    combinedCourseId,
    participationId,
  });
}
