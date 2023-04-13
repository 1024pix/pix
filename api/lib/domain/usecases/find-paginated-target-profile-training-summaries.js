module.exports = async function findPaginatedTargetProfileTrainings({ targetProfileId, page, trainingRepository }) {
  const { trainings, pagination } = await trainingRepository.findPaginatedSummariesByTargetProfileId({
    targetProfileId,
    page,
  });

  return {
    trainings,
    meta: { pagination },
  };
};
