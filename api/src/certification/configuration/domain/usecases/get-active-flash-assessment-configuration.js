import * as injectedSharedFlashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
export const getActiveFlashAssessmentConfiguration = async ({
  sharedFlashAlgorithmConfigurationRepository = injectedSharedFlashAlgorithmConfigurationRepository,
} = {}) => {
  return sharedFlashAlgorithmConfigurationRepository.getMostRecent();
};
