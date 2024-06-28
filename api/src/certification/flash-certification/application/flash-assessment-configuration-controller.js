import { usecases } from '../domain/usecases/index.js';
import * as flashAlgorithmConfigurationSerializer from '../infrastructure/serializers/flash-algorithm-configuration-serializer.js';

const getActiveFlashAssessmentConfiguration = async (
  req,
  h,
  dependencies = { flashAlgorithmConfigurationSerializer },
) => {
  const flashAlgorithmConfiguration = await usecases.getActiveFlashAssessmentConfiguration();
  return h
    .response(dependencies.flashAlgorithmConfigurationSerializer.serialize({ flashAlgorithmConfiguration }))
    .code(200);
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
