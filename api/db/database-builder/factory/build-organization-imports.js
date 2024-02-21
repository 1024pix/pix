import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';
import { buildOrganization } from './build-organization.js';
import { buildUser } from './build-user.js';
import { IMPORT_STATUSES } from '../../../src/prescription/learner-management/domain/constants.js';

const buildOrganizationImport = function buildOrganizationImports({
  id = databaseBuffer.getNextId(),
  status = IMPORT_STATUSES.UPLOADED,
  filename = 'test.csv',
  encoding = 'utf8',
  errors,
  updatedAt = new Date('2023-01-02'),
  createdAt = new Date('2023-01-01'),
  createdBy,
  organizationId,
} = {}) {
  const values = {
    id,
    status,
    filename,
    encoding,
    errors,
    updatedAt,
    createdAt,
    createdBy: _.isUndefined(createdBy) ? buildUser().id : createdBy,
    organizationId: _.isUndefined(organizationId) ? buildOrganization().id : organizationId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-imports',
    values,
  });
};

export { buildOrganizationImport };
