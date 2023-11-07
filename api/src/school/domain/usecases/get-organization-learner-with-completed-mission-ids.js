const getOrganizationLearnerWithCompletedMissionIds = async function ({
  organizationLearnerId,
  missionAssessmentRepository,
  organizationLearnersRepository,
} = {}) {
  const learner = await organizationLearnersRepository.getById(organizationLearnerId);
  learner.completedMissionIds = await missionAssessmentRepository.getAllCompletedMissionIds(organizationLearnerId);
  return learner;
};

export { getOrganizationLearnerWithCompletedMissionIds };
