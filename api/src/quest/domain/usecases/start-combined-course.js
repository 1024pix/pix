import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

export async function startCombinedCourse({
  userId,
  code,
  combinedCourseParticipantRepository = injectedRepositories.combinedCourseParticipantRepository,
  combinedCourseRepository = injectedRepositories.combinedCourseRepository,
  combinedCourseParticipationRepository = injectedRepositories.combinedCourseParticipationRepository,
  userRepository = injectedRepositories.userRepository,
} = {}) {
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  const user = await userRepository.findById({ userId });

  const organizationLearnerId = await combinedCourseParticipantRepository.getOrCreateNewOrganizationLearner({
    userId,
    organizationId: combinedCourse.organizationId,
    organizationLearner: { firstName: user.firstName, lastName: user.lastName },
  });

  await combinedCourseParticipationRepository.save({ organizationLearnerId, questId: combinedCourse.id });
}
