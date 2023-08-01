import { ORGANIZATION_FEATURE } from '../../../../lib/domain/constants.js';

const featuresBuilder = function ({ databaseBuilder }) {
  databaseBuilder.factory.buildFeature({
    key: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
    description: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.description,
  });
  databaseBuilder.factory.buildFeature({
    key: ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
    description: ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.description,
  });
};

export { featuresBuilder };
