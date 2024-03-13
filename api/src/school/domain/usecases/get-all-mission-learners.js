const findPaginatedMissionLearners = async function ({ missionLearnerRepository, organizationId, page } = {}) {
  return await missionLearnerRepository.findPaginatedMissionLearners({ organizationId, page });
};

export { findPaginatedMissionLearners };
