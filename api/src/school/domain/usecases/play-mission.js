import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as injectedAssessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import { MissionAssessment } from '../../infrastructure/models/mission-assessment.js';
import * as injectedActivityRepository from '../../infrastructure/repositories/activity-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';
import * as injectedMissionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import * as injectedMissionRepository from '../../infrastructure/repositories/mission-repository.js';
import { Assessment } from '../models/Assessment.js';
import { initMissionActivity } from '../services/init-mission-activity.js';

export async function playMission({
  missionId,
  organizationLearnerId,
  activityRepository = injectedActivityRepository,
  assessmentRepository = injectedAssessmentRepository,
  missionAssessmentRepository = injectedMissionAssessmentRepository,
  missionRepository = injectedMissionRepository,
  organizationLearnerRepository = injectedRepositories.organizationLearnerRepository,
} = {}) {
  const missionAssessment = await missionAssessmentRepository.getCurrent(missionId, organizationLearnerId);

  if (missionAssessment) {
    return getAssessment({ missionAssessment, assessmentRepository });
  }

  await _checkOrganizationLearnerExists({ organizationLearnerRepository, organizationLearnerId });

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

async function createAssessment({ assessmentRepository }) {
  const assessmentData = Assessment.createForPix1dMission();

  return assessmentRepository.save({ assessment: assessmentData });
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

async function _checkOrganizationLearnerExists({ organizationLearnerRepository, organizationLearnerId }) {
  await organizationLearnerRepository.getById({ organizationLearnerId });
}
