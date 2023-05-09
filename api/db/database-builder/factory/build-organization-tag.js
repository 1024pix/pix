import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';
import { buildTag } from './build-tag.js';
import _ from 'lodash';

const buildOrganizationTag = function ({ id = databaseBuffer.getNextId(), organizationId, tagId } = {}) {
  tagId = _.isUndefined(tagId) ? buildTag().id : tagId;
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;

  const values = {
    id,
    organizationId,
    tagId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'organization-tags',
    values,
  });
};

export { buildOrganizationTag };
