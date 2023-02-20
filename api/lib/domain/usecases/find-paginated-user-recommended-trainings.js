async function findPaginatedUserRecommendedTrainings({ userId, locale, page, trainingRepository }) {
  const { userRecommendedTrainings, pagination } = await trainingRepository.findPaginatedByUserId({
    userId,
    locale,
    page,
  });
  return {
    userRecommendedTrainings,
    meta: {
      pagination,
    },
  };
}

export default findPaginatedUserRecommendedTrainings;
