import { usecases } from '../../shared/domain/usecases/index.js';

const getActiveFlashAssessmentConfiguration = async (req, h) => {
  const flashAssessmentConfiguration = await usecases.getActiveFlashAssessmentConfiguration();
  return h.response(flashAssessmentConfiguration);
};

export const flashAssessmentConfigurationController = {
  getActiveFlashAssessmentConfiguration,
};
