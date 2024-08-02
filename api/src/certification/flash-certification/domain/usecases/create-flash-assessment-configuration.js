import { FlashAssessmentAlgorithmConfiguration } from '../../../shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';

export const createFlashAssessmentConfiguration = async ({
  configuration,
  flashAlgorithmConfigurationRepository,
  sharedFlashAlgorithmConfigurationRepository,
}) => {
  const previousConfiguration = await sharedFlashAlgorithmConfigurationRepository.getMostRecent();
  await flashAlgorithmConfigurationRepository.save(
    new FlashAssessmentAlgorithmConfiguration({
      ...previousConfiguration,
      ...configuration,
      createdAt: new Date(),
    }),
  );
};
