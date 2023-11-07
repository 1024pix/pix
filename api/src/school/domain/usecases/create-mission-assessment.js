import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { MissionAssessment } from '../models/MissionAssessment.js';

const createMissionAssessment = async function ({
  missionId,
  organizationLearnerId,
  assessmentRepository,
  missionAssessmentRepository,
}) {
  const assessment = Assessment.createForPix1dMission();
  const persistedAssessment = await assessmentRepository.save({ assessment });

  const missionAssessment = new MissionAssessment({
    missionId,
    assessmentId: persistedAssessment.id,
    organizationLearnerId,
  });
  await missionAssessmentRepository.save({ missionAssessment });

  return missionAssessment;
};

export { createMissionAssessment };
