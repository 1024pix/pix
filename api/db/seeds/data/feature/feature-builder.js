import * as apps from '../../../../lib/domain/constants.js';

const featuresBuilder = function ({ databaseBuilder }) {
  databaseBuilder.factory.buildFeature({
    key: apps.ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT,
  });
};

export { featuresBuilder };
