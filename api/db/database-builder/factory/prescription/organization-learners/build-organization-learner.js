import _ from 'lodash';

import { databaseBuffer } from '../../../database-buffer.js';
import { buildOrganization } from '../../build-organization.js';
import { buildUser } from '../../build-user.js';

const buildOrganizationLearner = function ({
  id = databaseBuffer.getNextId(),
  firstName = 'first-name',
  lastName = 'last-name',
  isDisabled = false,
  createdAt = new Date('2021-01-01'),
  updatedAt = new Date('2021-02-01'), // for BEGINNING_OF_THE_2020_SCHOOL_YEAR, can outdate very fast! ;)
  organizationId,
  userId,
  deletedBy = null,
  deletedAt = null,
  attributes = null,
} = {}) {
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  userId = _.isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    lastName,
    firstName,
    isDisabled,
    createdAt,
    updatedAt,
    organizationId,
    userId,
    deletedBy,
    deletedAt,
    attributes,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-learners',
    values,
  });
};
const buildOndeOrganizationLearner = function ({ division, ...args } = {}) {
  const attributes = {
    ...args.attributes,
    'Libellé classe': division || 'CM2A',
  };
  return buildOrganizationLearner({ ...args, attributes, division });
};

export { buildOndeOrganizationLearner, buildOrganizationLearner };
