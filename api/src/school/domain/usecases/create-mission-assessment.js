import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { MissionAssessment } from '../models/MissionAssessment.js';

const createMissionAssessment = async function ({ missionId, assessmentRepository, missionAssessmentRepository }) {
  const assessment = Assessment.createForPix1dMission({ missionId });
  const persistedAssessment = await assessmentRepository.save({ assessment });

  //TODO const missionAssessment = MissionAssessment.create({missionId, organizationLearnerId, assessmentId: persistedAssessment.id})
  const missionAssessment = new MissionAssessment({ missionId, assessmentId: persistedAssessment.id });
  await missionAssessmentRepository.save({ missionAssessment });

  return persistedAssessment;
};

export { createMissionAssessment };
