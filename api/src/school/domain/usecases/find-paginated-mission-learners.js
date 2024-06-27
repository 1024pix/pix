import { MissionLearner } from '../models/MissionLearner.js';
import { getMissionResult } from '../services/get-mission-result.js';

const findPaginatedMissionLearners = async function ({
  missionLearnerRepository,
  missionAssessmentRepository,
  activityRepository,
  organizationId,
  missionId,
  page,
  filter,
} = {}) {
  const { pagination, missionLearners } = await missionLearnerRepository.findPaginatedMissionLearners({
    organizationId,
    page,
    filter,
  });

  const missionLearnersWithStatus = await missionAssessmentRepository.getStatusesForLearners(
    missionId,
    missionLearners,
    async (learner, status, assessmentId) => {
      const missionLearner = new MissionLearner({
        ...learner,
        status: status ?? 'not-started',
      });
      if (assessmentId && status === 'completed') {
        const activities = await activityRepository.getAllByAssessmentId(assessmentId);

        missionLearner.result = getMissionResult({ activities });
      }
      return missionLearner;
    },
  );

  return { pagination, missionLearners: missionLearnersWithStatus };
};

export { findPaginatedMissionLearners };
