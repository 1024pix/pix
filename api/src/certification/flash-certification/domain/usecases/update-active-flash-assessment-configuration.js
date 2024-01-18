import { FlashAssessmentAlgorithmConfiguration } from '../models/FlashAssessmentAlgorithmConfiguration.js';

export const updateActiveFlashAssessmentConfiguration = async ({
  flashAlgorithmConfigurationRepository,
  configuration,
}) => {
  const previousConfiguration = await flashAlgorithmConfigurationRepository.get();
  await flashAlgorithmConfigurationRepository.save(
    new FlashAssessmentAlgorithmConfiguration({
      ...previousConfiguration,
      ...configuration,
    }),
  );
};
