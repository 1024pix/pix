export async function startCombinedCourse({
  userId,
  code,
  combinedCourseParticipantRepository,
  combinedCourseRepository,
  organizationLearnerParticipationRepository,
  userRepository,
}) {
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  const user = await userRepository.findById({ userId });

  const { id: organizationLearnerId } = await combinedCourseParticipantRepository.getOrCreateNewOrganizationLearner({
    userId,
    organizationId: combinedCourse.organizationId,
    organizationLearner: { firstName: user.firstName, lastName: user.lastName },
  });

  await organizationLearnerParticipationRepository.saveCombinedCourseParticipation({
    organizationLearnerId,
    combinedCourseId: combinedCourse.id,
  });
}
