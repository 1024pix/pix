import databaseBuffer from '../database-buffer';
import buildUser from './build-user';
import buildOrganization from './build-organization';
import _ from 'lodash';

export default function buildUserOrgaSettings({ id = databaseBuffer.getNextId(), currentOrganizationId, userId } = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  currentOrganizationId = _.isUndefined(currentOrganizationId) ? buildOrganization().id : currentOrganizationId;

  const values = {
    id,
    currentOrganizationId,
    userId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'user-orga-settings',
    values,
  });
}
