export default async function findPaginatedTrainingSummaries({ page, trainingRepository }) {
  const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ page });

  return {
    trainings,
    meta: { pagination },
  };
}
