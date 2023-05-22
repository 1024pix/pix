import { databaseBuffer } from '../database-buffer.js';
import { buildUser } from './build-user.js';
import { buildOrganization } from './build-organization.js';
import _ from 'lodash';

const buildUserOrgaSettings = function ({ id = databaseBuffer.getNextId(), currentOrganizationId, userId } = {}) {
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
};

export { buildUserOrgaSettings };
