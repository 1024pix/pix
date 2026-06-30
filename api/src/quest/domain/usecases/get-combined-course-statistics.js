import { CombinedCourseStatistics } from '../models/combined-courses/value-objects/CombinedCourseStatistics.js';

export const getCombinedCourseStatistics = async ({ combinedCourseId, combinedCourseParticipationRepository }) => {
  const allCombinedCourseParticipations = await combinedCourseParticipationRepository.findByCombinedCourseIds({
    combinedCourseIds: [combinedCourseId],
  });

  const completedParticipations = allCombinedCourseParticipations.filter((participation) =>
    participation.isCompleted(),
  );

  return new CombinedCourseStatistics({
    id: combinedCourseId,
    participationsCount: allCombinedCourseParticipations.length,
    completedParticipationsCount: completedParticipations.length,
  });
};
