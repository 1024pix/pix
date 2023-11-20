import { Assessment } from '../models/Assessment.js';
import { MissionAssessment } from '../../infrastructure/models/mission-assessment.js';

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

  return new Assessment({ ...persistedAssessment, ...missionAssessment });
};

export { createMissionAssessment };
