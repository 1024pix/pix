import { MissionAssessment } from '../../infrastructure/models/mission-assessment.js';
import { Assessment } from '../models/Assessment.js';

export async function getOrCreateAssessment({
  missionId,
  organizationLearnerId,
  assessmentRepository,
  missionAssessmentRepository,
}) {
  const missionAssessment = await missionAssessmentRepository.getCurrent(missionId, organizationLearnerId);

  if (missionAssessment) {
    return getAssessment({ missionAssessment, assessmentRepository });
  }
  return createAssessment({ missionId, organizationLearnerId, assessmentRepository, missionAssessmentRepository });
}

async function getAssessment({ missionAssessment, assessmentRepository }) {
  const assessment = await assessmentRepository.get(missionAssessment.assessmentId);
  return new Assessment({ ...assessment, ...missionAssessment });
}

async function createAssessment({
  missionId,
  organizationLearnerId,
  assessmentRepository,
  missionAssessmentRepository,
}) {
  const assessmentData = Assessment.createForPix1dMission();
  const assessment = await assessmentRepository.save({ assessment: assessmentData });

  const missionAssessment = new MissionAssessment({
    missionId,
    assessmentId: assessment.id,
    organizationLearnerId,
  });
  await missionAssessmentRepository.save({ missionAssessment });
  return new Assessment({ ...assessment, ...missionAssessment });
}
