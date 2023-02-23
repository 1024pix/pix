const settings = require('../../config.js');
const serializer = require('../../infrastructure/serializers/jsonapi/feature-toggle-serializer.js');

module.exports = {
  getActiveFeatures() {
    return serializer.serialize(settings.featureToggles);
  },
};
