import { config } from '../../../../config/config.js';
import { OrganizationLearnerParticipationStatuses } from '../models/combined-course-participations/entities/OrganizationLearnerParticipation.js';

export const findCombinedCourseParticipationsForUser = async ({
  userId,
  organizationLearnerParticipationRepository,
  combinedCourseIdsExploreIA = config.exploreIA.combinedCourseIds,
}) => {
  if (
    !combinedCourseIdsExploreIA ||
    !Array.isArray(combinedCourseIdsExploreIA) ||
    combinedCourseIdsExploreIA.length === 0
  ) {
    return false;
  }
  const idsExploreIA = combinedCourseIdsExploreIA.map(String);

  const participations = await organizationLearnerParticipationRepository.findByUserId({ userId });
  if (!participations.length) {
    return false;
  }

  const participationsExploreIA = participations.filter((participation) =>
    idsExploreIA.includes(participation.referenceId),
  );
  if (participationsExploreIA.length === 0) {
    return false;
  }

  const participatedCombinedCourseIds = new Set(
    participationsExploreIA.map((participation) => participation.referenceId),
  );
  for (const idExploreIA of idsExploreIA) {
    const hasParticipationForCurrentId = participatedCombinedCourseIds.has(idExploreIA);
    if (!hasParticipationForCurrentId) {
      return true;
    }
  }

  for (const participation of participationsExploreIA) {
    if (participation.status !== OrganizationLearnerParticipationStatuses.COMPLETED) {
      return true;
    }
  }

  return false;
};
