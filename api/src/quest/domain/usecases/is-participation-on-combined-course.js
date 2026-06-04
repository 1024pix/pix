export async function isParticipationOnCombinedCourse({
  combinedCourseId,
  participationId,
  combinedCourseParticipationRepository,
}) {
  return await combinedCourseParticipationRepository.isParticipationOnCombinedCourse({
    combinedCourseId,
    participationId,
  });
}
