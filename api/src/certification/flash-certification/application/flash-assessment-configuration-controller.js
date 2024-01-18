import { usecases } from '../../shared/domain/usecases/index.js';

const getActiveFlashAssessmentConfiguration = async (req, h) => {
  const flashAssessmentConfiguration = await usecases.getActiveFlashAssessmentConfiguration();
  return h.response(flashAssessmentConfiguration);
};

const updateActiveFlashAssessmentConfiguration = async (req, h) => {
  const { payload } = req;
  await usecases.updateActiveFlashAssessmentConfiguration({
    configuration: payload,
  });
  return h.response().code(204);
};

export const flashAssessmentConfigurationController = {
  getActiveFlashAssessmentConfiguration,
  updateActiveFlashAssessmentConfiguration,
};
