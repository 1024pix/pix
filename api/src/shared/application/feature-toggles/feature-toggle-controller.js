import { featureToggles } from '../../infrastructure/feature-toggles/index.js';
import * as serializer from '../../infrastructure/serializers/jsonapi/feature-toggle-serializer.js';

const getActiveFeatures = async function () {
  const featureTogglesList = await featureToggles.withTag('frontend');

  return serializer.serialize(featureTogglesList);
};

export const featureToggleController = { getActiveFeatures };
