import _ from 'lodash';

import { databaseBuffer } from '../../../database-buffer.js';
import { buildFeature } from '../../build-feature.js';
import { buildOrganizationLearner } from '../../build-organization-learner.js';

const buildOrganizationLearnerFeature = function ({
  id = databaseBuffer.getNextId(),
  organizationLearnerId,
  featureId,
} = {}) {
  organizationLearnerId = _.isUndefined(organizationLearnerId) ? buildOrganizationLearner().id : organizationLearnerId;
  featureId = _.isUndefined(featureId) ? buildFeature().id : featureId;

  const values = {
    id,
    organizationLearnerId,
    featureId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-learner-features',
    values,
  });
};

export { buildOrganizationLearnerFeature };
