import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import * as injectedSharedFlashAlgorithmConfigurationRepository from '../../../shared/infrastructure/repositories/flash-algorithm-configuration-repository.js';
import * as injectedFlashAlgorithmConfigurationRepository from '../../infrastructure/repositories/flash-algorithm-configuration-repository.js';

export const createFlashAssessmentConfiguration = async ({
  configuration,
  flashAlgorithmConfigurationRepository = injectedFlashAlgorithmConfigurationRepository,
  sharedFlashAlgorithmConfigurationRepository = injectedSharedFlashAlgorithmConfigurationRepository,
} = {}) => {
  const previousConfiguration = await sharedFlashAlgorithmConfigurationRepository.getMostRecent();
  await flashAlgorithmConfigurationRepository.save(
    new FlashAssessmentAlgorithmConfiguration({
      ...previousConfiguration,
      ...configuration,
      createdAt: new Date(),
    }),
  );
};
