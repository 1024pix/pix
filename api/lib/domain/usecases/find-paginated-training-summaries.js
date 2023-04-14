module.exports = async function findPaginatedTrainingSummaries({ filter, page, trainingRepository }) {
  const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ filter, page });

  return {
    trainings,
    meta: { pagination },
  };
};
