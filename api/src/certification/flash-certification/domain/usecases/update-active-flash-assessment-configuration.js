import { FlashAssessmentAlgorithmConfiguration } from '../models/FlashAssessmentAlgorithmConfiguration.js';

export const updateActiveFlashAssessmentConfiguration = async ({
  flashAlgorithmConfigurationRepository,
  configuration,
}) => {
  const previousConfiguration = await flashAlgorithmConfigurationRepository.getMostRecent();
  await flashAlgorithmConfigurationRepository.save(
    new FlashAssessmentAlgorithmConfiguration({
      ...previousConfiguration,
      ...configuration,
      createdAt: new Date(),
    }),
  );
};
