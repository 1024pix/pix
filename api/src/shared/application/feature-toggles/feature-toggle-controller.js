import * as serializer from '../../../../lib/infrastructure/serializers/jsonapi/feature-toggle-serializer.js';
import { config } from '../../../../src/shared/config.js';

const getActiveFeatures = function () {
  return serializer.serialize(config.featureToggles);
};

const featureToggleController = { getActiveFeatures };

export { featureToggleController };
