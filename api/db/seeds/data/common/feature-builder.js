import { ORGANIZATION_FEATURE } from '../../../../lib/domain/constants.js';
import {
  FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
} from './constants.js';

const featuresBuilder = async function ({ databaseBuilder }) {
  databaseBuilder.factory.buildFeature({
    id: FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
    key: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
    description: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.description,
  });
  databaseBuilder.factory.buildFeature({
    id: FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
    key: ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.key,
    description: ORGANIZATION_FEATURE.COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY.description,
  });
  await databaseBuilder.commit();
};

export { featuresBuilder };
