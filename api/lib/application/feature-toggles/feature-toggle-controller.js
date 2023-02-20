import settings from '../../config';
import serializer from '../../infrastructure/serializers/jsonapi/feature-toggle-serializer';

export default {
  getActiveFeatures() {
    return serializer.serialize(settings.featureToggles);
  },
};
