const settings = require('../../config');
const serializer = require('../../infrastructure/serializers/jsonapi/feature-toggle-serializer');

module.exports = {
  getActiveFeatures() {
    const toggles = {
      ...settings.featureToggles,
      isNeutralizationAutoEnabled: true,
    };
    return serializer.serialize(toggles);
  },
};
