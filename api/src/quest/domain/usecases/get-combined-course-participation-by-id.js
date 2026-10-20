import { NotFoundError } from '../../../shared/domain/errors.js';

export const getCombinedCourseParticipationById = async ({
  participationId,
  combinedCourseId,
  organizationLearnerParticipationRepository,
  combinedCourseDetailsService,
}) => {
  const participation = await organizationLearnerParticipationRepository.findCombinedCourseParticipationById({
    participationId,
  });

  if (participation === null) {
    throw new NotFoundError(
      `CombinedCourseParticipation introuvable à l'id ${participationId} pour le combined course ${combinedCourseId}`,
    );
  }

  const combinedCourseDetails = await combinedCourseDetailsService.instantiateCombinedCourseDetails({
    combinedCourseId: combinedCourseId,
  });

  return combinedCourseDetailsService.getCombinedCourseDetails({
    organizationLearnerId: participation.organizationLearnerId,
    combinedCourseDetails,
  });
};
