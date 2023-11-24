const findPaginatedTrainingSummaries = async function ({ filter, page, trainingRepository }) {
  const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ filter, page });

  return {
    trainings,
    meta: { pagination },
  };
};

export { findPaginatedTrainingSummaries };
