import { settings } from '../../config.js';
import * as serializer from '../../infrastructure/serializers/jsonapi/feature-toggle-serializer.js';

const getActiveFeatures = function () {
  return serializer.serialize(settings.featureToggles);
};

export { getActiveFeatures };
