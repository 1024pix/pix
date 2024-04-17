const getOrganizationLearnerWithCompletedMissionIds = async function ({
  organizationLearnerId,
  missionAssessmentRepository,
  organizationLearnerRepository,
} = {}) {
  const learner = await organizationLearnerRepository.getById({ organizationLearnerId });
  learner.completedMissionIds = await missionAssessmentRepository.getAllCompletedMissionIds(organizationLearnerId);
  return learner;
};

export { getOrganizationLearnerWithCompletedMissionIds };
