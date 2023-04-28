const apps = require('../../../../lib/domain/constants.js');

module.exports = function featuresBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildFeature({
    key: apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT,
  });
};
