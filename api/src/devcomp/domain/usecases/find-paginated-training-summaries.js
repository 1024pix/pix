import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';

const findPaginatedTrainingSummaries = async function ({
  filter,
  page,
  trainingRepository = injectedTrainingRepository,
} = {}) {
  const { trainings, pagination } = await trainingRepository.findPaginatedSummaries({ filter, page });

  return {
    trainings,
    meta: { pagination },
  };
};

export { findPaginatedTrainingSummaries };
