const getOrganizationLearnerWithMissionIdsByState = async function ({
  organizationLearnerId,
  missionAssessmentRepository,
  organizationLearnerRepository,
} = {}) {
  const learner = await organizationLearnerRepository.getById({ organizationLearnerId });
  const { started, completed } = await missionAssessmentRepository.getMissionIdsByState(organizationLearnerId);
  learner.startedMissionIds = started;
  learner.completedMissionIds = completed;
  return learner;
};

export { getOrganizationLearnerWithMissionIdsByState };
