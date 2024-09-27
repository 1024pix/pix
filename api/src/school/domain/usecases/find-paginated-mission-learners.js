export { filterByGlobalResult, findPaginatedMissionLearners };

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
    filter: { divisions: filter.divisions, name: filter.name },
  });

  const missionLearnersWithStatus = await missionAssessmentRepository.getStatusesForLearners(
    missionId,
    missionLearners,
  );

  return _paginateMissionLearner(filterByGlobalResult(missionLearnersWithStatus, filter.results), page);
};

function filterByGlobalResult(missionLearners, resultFilter) {
  if (!resultFilter) {
    return missionLearners;
  }
  return missionLearners.filter(
    (missionLearner) =>
      (resultFilter.includes('no-result') && missionLearner.result?.global === undefined) ||
      resultFilter.includes(missionLearner.result?.global),
  );
}

function _paginateMissionLearner(missionLearners, page) {
  const rowCount = missionLearners.length;
  const firstLearnerIndex = ((page.number || 1) - 1) * page.size;
  const lastLearnerIndex = firstLearnerIndex + page.size;
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
