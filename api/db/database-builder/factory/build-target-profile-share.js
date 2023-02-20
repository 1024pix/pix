import buildOrganization from './build-organization';
import buildTargetProfile from './build-target-profile';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildTargetProfileShare({
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
}
