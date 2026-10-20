import { CombinedCourseStatistics } from '../models/combined-courses/value-objects/CombinedCourseStatistics.ts';

export const getCombinedCourseStatistics = async ({ combinedCourseId, organizationLearnerParticipationRepository }) => {
  const allCombinedCourseParticipations = await organizationLearnerParticipationRepository.findByCombinedCourseIds({
    combinedCourseIds: [combinedCourseId],
  });

  const completedParticipations = allCombinedCourseParticipations.filter((participation) => participation.isCompleted);

  return new CombinedCourseStatistics({
    id: combinedCourseId,
    participationsCount: allCombinedCourseParticipations.length,
    completedParticipationsCount: completedParticipations.length,
  });
};
