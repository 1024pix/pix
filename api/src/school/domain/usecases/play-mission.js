import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { MissionAssessment } from '../../infrastructure/models/mission-assessment.js';
import { Assessment } from '../models/Assessment.js';
import { initMissionActivity } from '../services/init-mission-activity.js';

export async function playMission({
  missionId,
  organizationLearnerId,
  activityRepository,
  assessmentRepository,
  missionAssessmentRepository,
  missionRepository,
}) {
  const missionAssessment = await missionAssessmentRepository.getCurrent(missionId, organizationLearnerId);

  if (missionAssessment) {
    return getAssessment({ missionAssessment, assessmentRepository });
  }
  return _startMission({
    missionId,
    organizationLearnerId,
    assessmentRepository,
    missionAssessmentRepository,
    activityRepository,
    missionRepository,
  });
}

async function getAssessment({ missionAssessment, assessmentRepository }) {
  const assessment = await assessmentRepository.get(missionAssessment.assessmentId);
  return new Assessment({ ...assessment, ...missionAssessment });
}

async function _startMission({
  missionId,
  organizationLearnerId,
  activityRepository,
  assessmentRepository,
  missionAssessmentRepository,
  missionRepository,
}) {
  return DomainTransaction.execute(async () => {
    const assessment = await createAssessment({ assessmentRepository });
    const missionAssessment = await createMissionAssessment({
      assessmentId: assessment.id,
      missionId,
      organizationLearnerId,
      missionAssessmentRepository,
    });
    await initMissionActivity({
      assessmentId: assessment.id,
      activityRepository,
      missionAssessmentRepository,
      missionRepository,
    });
    return new Assessment({ ...assessment, ...missionAssessment });
  });
}

async function createAssessment({ assessmentRepository, domainTransaction }) {
  const assessmentData = Assessment.createForPix1dMission();

  return assessmentRepository.save({ assessment: assessmentData, domainTransaction });
}

async function createMissionAssessment({
  assessmentId,
  missionId,
  organizationLearnerId,
  missionAssessmentRepository,
}) {
  const missionAssessment = new MissionAssessment({
    missionId,
    assessmentId,
    organizationLearnerId,
  });
  await missionAssessmentRepository.save({ missionAssessment });

  return missionAssessment;
}
