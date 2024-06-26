import { usecases } from '../domain/usecases/index.js';

const getActiveFlashAssessmentConfiguration = async (req, h) => {
  const flashAssessmentConfiguration = await usecases.getActiveFlashAssessmentConfiguration();
  return h.response(flashAssessmentConfiguration);
};

const createFlashAssessmentConfiguration = async (req, h) => {
  const { payload } = req;
  await usecases.createFlashAssessmentConfiguration({
    configuration: payload,
  });
  return h.response().code(204);
};

export const flashAssessmentConfigurationController = {
  getActiveFlashAssessmentConfiguration,
  createFlashAssessmentConfiguration,
};
