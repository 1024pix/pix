import databaseBuffer from '../database-buffer';
import buildUser from './build-user';
import buildOrganization from './build-organization';
import Membership from '../../../lib/domain/models/Membership';
import _ from 'lodash';

export default function buildMembership({
  id = databaseBuffer.getNextId(),
  organizationRole = Membership.roles.MEMBER,
  organizationId,
  userId,
  createdAt = new Date(),
  updatedAt = new Date(),
  disabledAt,
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    organizationId,
    organizationRole,
    userId,
    createdAt,
    updatedAt,
    disabledAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'memberships',
    values,
  });
}
