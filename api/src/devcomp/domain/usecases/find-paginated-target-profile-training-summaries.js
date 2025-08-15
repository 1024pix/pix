import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';

const findPaginatedTargetProfileTrainingSummaries = async function ({
  targetProfileId,
  page,
  trainingRepository = injectedTrainingRepository,
} = {}) {
  const { trainings, pagination } = await trainingRepository.findPaginatedSummariesByTargetProfileId({
    targetProfileId,
    page,
  });

  return {
    trainings,
    meta: { pagination },
  };
};

export { findPaginatedTargetProfileTrainingSummaries };
