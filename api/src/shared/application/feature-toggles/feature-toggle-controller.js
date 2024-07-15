import { config } from '../../../../lib/config.js';
import * as serializer from '../../../../lib/infrastructure/serializers/jsonapi/feature-toggle-serializer.js';

const getActiveFeatures = function () {
  return serializer.serialize(config.featureToggles);
};

const featureToggleController = { getActiveFeatures };

export { featureToggleController };
