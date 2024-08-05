export const getActiveFlashAssessmentConfiguration = async ({ sharedFlashAlgorithmConfigurationRepository }) => {
  return sharedFlashAlgorithmConfigurationRepository.getMostRecent();
};
