import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildUser } from './build-user.js';

const buildOrganizationLearnerImportFormat = function ({
  id = databaseBuffer.getNextId(),
  name = 'MY_CUSTOM_EXPORT',
  fileType = 'csv',
  config = {
    acceptedEncoding: ['utf-8'],
    validationRules: { unicity: ['my_column'], formats: [{ name: 'my_column', type: 'string' }] },
    headers: [{ name: 'my_column', required: true }],
  },
  createdAt = new Date('2021-01-01'),
  createdBy,
  updatedAt = new Date('2021-02-01'),
} = {}) {
  createdBy = _.isUndefined(createdBy) ? buildUser().id : createdBy;
  const values = {
    id,
    name,
    fileType,
    config,
    createdAt,
    updatedAt,
    createdBy,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-learner-import-formats',
    values,
  });
};

export { buildOrganizationLearnerImportFormat };
