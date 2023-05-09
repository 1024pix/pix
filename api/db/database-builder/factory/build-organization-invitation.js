import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';
import { OrganizationInvitation } from '../../../lib/domain/models/OrganizationInvitation.js';
import _ from 'lodash';

const buildOrganizationInvitation = function ({
  id = databaseBuffer.getNextId(),
  organizationId,
  email = 'some.mail@example.net',
  status = OrganizationInvitation.StatusType.PENDING,
  code = 'INVIABC123',
  role = null,
  updatedAt = new Date('2020-01-01'),
} = {}) {
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  email = email.toLowerCase();

  const values = {
    id,
    organizationId,
    email,
    status,
    code,
    role,
    createdAt: new Date(),
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'organization-invitations',
    values,
  });
};

export { buildOrganizationInvitation };
