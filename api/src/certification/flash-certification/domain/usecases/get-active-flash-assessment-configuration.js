export const getActiveFlashAssessmentConfiguration = async ({ flashAlgorithmConfigurationRepository }) => {
  return flashAlgorithmConfigurationRepository.getMostRecent();
};
