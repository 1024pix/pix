import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';
import { buildProfileReward } from './build-profile-reward.js';

const buildOrganizationsProfileRewards = function ({
  id = databaseBuffer.getNextId(),
  profileRewardId,
  organizationId,
} = {}) {
  if (profileRewardId === undefined) profileRewardId = buildProfileReward().id;
  if (organizationId === undefined) organizationId = buildOrganization().id;

  const values = {
    id,
    profileRewardId,
    organizationId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organizations-profile-rewards',
    values,
  });
};

export { buildOrganizationsProfileRewards };
