import { MissionLearnerWithStatus } from '../models/MissionLearnerWithStatus.js';

const findPaginatedMissionLearners = async function ({
  missionLearnerRepository,
  missionAssessmentRepository,
  organizationId,
  missionId,
  page,
} = {}) {
  const { pagination, missionLearners } = await missionLearnerRepository.findPaginatedMissionLearners({
    organizationId,
    page,
  });

  const missionLearnersWithStatus = await missionAssessmentRepository.getStatusesForLearners(
    missionId,
    missionLearners,
    (learner, status) =>
      new MissionLearnerWithStatus({
        ...learner,
        status: status ?? 'not-started',
      }),
  );

  return { pagination, missionLearners: missionLearnersWithStatus };
};

export { findPaginatedMissionLearners };
