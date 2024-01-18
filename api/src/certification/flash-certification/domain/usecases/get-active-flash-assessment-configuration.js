export const getActiveFlashAssessmentConfiguration = async ({ flashAlgorithmConfigurationRepository }) => {
  return flashAlgorithmConfigurationRepository.get();
};
