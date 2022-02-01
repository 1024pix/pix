const settings = require('../../config');
const serializer = require('../../infrastructure/serializers/jsonapi/feature-toggle-serializer');

module.exports = {
  getActiveFeatures() {
    return serializer.serialize(settings.featureToggles);
  },
};
