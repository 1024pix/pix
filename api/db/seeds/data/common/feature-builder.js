import { ORGANIZATION_FEATURE } from '../../../../lib/domain/constants.js';
import {
  FEATURE_MULTIPLE_SENDING_ASSESSMENT_ID,
  FEATURE_COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY_ID,
  FEATURE_PLACES_MANAGEMENT_ID,
  FEATURE_MISSIONS_MANAGEMENT_ID,
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
  databaseBuilder.factory.buildFeature({
    id: FEATURE_PLACES_MANAGEMENT_ID,
    key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
    description: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.description,
  });
  databaseBuilder.factory.buildFeature({
    id: FEATURE_MISSIONS_MANAGEMENT_ID,
    key: ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.key,
    description: ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT.description,
  });
  await databaseBuilder.commit();
};

export { featuresBuilder };
