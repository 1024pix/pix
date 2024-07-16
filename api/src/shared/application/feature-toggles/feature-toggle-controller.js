import { config } from '../../../../src/shared/config.js';
import * as serializer from '../../infrastructure/serializers/jsonapi/feature-toggle-serializer.js';

const getActiveFeatures = function () {
  return serializer.serialize(config.featureToggles);
};

const featureToggleController = { getActiveFeatures };

export { featureToggleController };
