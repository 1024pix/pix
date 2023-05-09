const findPaginatedTargetProfileTrainings = async function ({ targetProfileId, page, trainingRepository }) {
  const { trainings, pagination } = await trainingRepository.findPaginatedSummariesByTargetProfileId({
    targetProfileId,
    page,
  });

  return {
    trainings,
    meta: { pagination },
  };
};

export { findPaginatedTargetProfileTrainings };
