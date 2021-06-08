const settings = require('../../config');
const serializer = require('../../infrastructure/serializers/jsonapi/feature-toggle-serializer');

module.exports = {
  getActiveFeatures() {
    const featureToggles = {
      ...settings.featureToggles,
      isCertificationResultsInOrgaEnabled: true,
    };
    return serializer.serialize(featureToggles);
  },
};
