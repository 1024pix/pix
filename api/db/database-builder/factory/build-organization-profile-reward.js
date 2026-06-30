import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';
import { buildProfileReward } from './build-profile-reward.js';

export const buildOrganizationProfileReward = ({
  id = databaseBuffer.getNextId(),
  organizationId,
  profileRewardId,
} = {}) => {
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  profileRewardId = _.isUndefined(profileRewardId) ? buildProfileReward().id : profileRewardId;

  const values = {
    id,
    organizationId,
    profileRewardId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organizations-profile-rewards',
    values,
  });
};
