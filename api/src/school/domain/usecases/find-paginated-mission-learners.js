const findPaginatedMissionLearners = async function ({
  missionLearnerRepository,
  missionAssessmentRepository,
  organizationId,
  missionId,
  page,
  filter,
} = {}) {
  const { missionLearners } = await missionLearnerRepository.findMissionLearners({
    organizationId,
    filter,
  });

  const missionLearnersWithStatus = await missionAssessmentRepository.getStatusesForLearners(
    missionId,
    missionLearners,
  );

  // faire le filtre sur le resultat

  return _paginateMissionLearner(missionLearnersWithStatus, page);
};

export { findPaginatedMissionLearners };

function _paginateMissionLearner(missionLearners, page) {
  const rowCount = missionLearners.length;
  const firstLearnerIndex = (page.number - 1) * page.size;
  const lastLearnerIndex = page.number * page.size - 1 + page.size;
  const missionLearnersPaginated = missionLearners.slice(firstLearnerIndex, lastLearnerIndex);
  const pageCount = Math.ceil(missionLearners.length / page.size);

  return {
    pagination: {
      page: page.number,
      pageCount,
      pageSize: page.size,
      rowCount,
    },
    missionLearners: missionLearnersPaginated,
  };
}
