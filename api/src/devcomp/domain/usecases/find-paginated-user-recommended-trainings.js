import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';
async function findPaginatedUserRecommendedTrainings({
  userId,
  locale,
  page,
  trainingRepository = injectedTrainingRepository,
} = {}) {
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

export { findPaginatedUserRecommendedTrainings };
