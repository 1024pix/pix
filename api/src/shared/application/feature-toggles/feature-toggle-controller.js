import { featureToggles } from '../../infrastructure/feature-toggles/index.js';
import { featureToggleSerializer } from '../../infrastructure/serializers/jsonapi/feature-toggle-serializer.js';

const getActiveFeatures = async function () {
  const featureTogglesList = await featureToggles.withTag('frontend');

  return featureToggleSerializer.serialize(featureTogglesList);
};

const featureToggleController = { getActiveFeatures };

export { featureToggleController };
