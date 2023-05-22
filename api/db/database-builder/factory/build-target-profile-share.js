import { buildOrganization } from './build-organization.js';
import { buildTargetProfile } from './build-target-profile.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';

const buildTargetProfileShare = function ({
  id = databaseBuffer.getNextId(),
  targetProfileId,
  organizationId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  targetProfileId = _.isUndefined(targetProfileId) ? buildTargetProfile().id : targetProfileId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    targetProfileId,
    organizationId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile-shares',
    values,
  });
};

export { buildTargetProfileShare };
