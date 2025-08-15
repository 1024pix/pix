import * as injectedMissionAssessmentRepository from '../../infrastructure/repositories/mission-assessment-repository.js';
import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

const getOrganizationLearnerWithMissionIdsByState = async function ({
  organizationLearnerId,
  missionAssessmentRepository = injectedMissionAssessmentRepository,
  organizationLearnerRepository = injectedRepositories.organizationLearnerRepository,
} = {}) {
  const learner = await organizationLearnerRepository.getById({ organizationLearnerId });
  const { started, completed } = await missionAssessmentRepository.getMissionIdsByState(organizationLearnerId);
  learner.startedMissionIds = started;
  learner.completedMissionIds = completed;
  return learner;
};

export { getOrganizationLearnerWithMissionIdsByState };
