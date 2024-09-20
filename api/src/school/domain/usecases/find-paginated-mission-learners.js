const findPaginatedMissionLearners = async function ({
  missionLearnerRepository,
  missionAssessmentRepository,
  organizationId,
  missionId,
  page,
  filter,
} = {}) {
  const { pagination, missionLearners } = await missionLearnerRepository.findPaginatedMissionLearners({
    organizationId,
    page,
    filter,
  });

  const missionLearnersWithStatus = await missionAssessmentRepository.getStatusesForLearners(
    missionId,
    missionLearners,
  );

  return { pagination, missionLearners: missionLearnersWithStatus };
};

export { findPaginatedMissionLearners };
