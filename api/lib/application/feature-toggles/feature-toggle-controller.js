import { config } from '../../config.js';
import * as serializer from '../../infrastructure/serializers/jsonapi/feature-toggle-serializer.js';

const getActiveFeatures = function () {
  return serializer.serialize(config.featureToggles);
};

export { getActiveFeatures };
