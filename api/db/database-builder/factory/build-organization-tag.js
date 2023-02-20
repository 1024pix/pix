import databaseBuffer from '../database-buffer';
import buildOrganization from './build-organization';
import buildTag from './build-tag';
import _ from 'lodash';

export default function buildOrganizationTag({ id = databaseBuffer.getNextId(), organizationId, tagId } = {}) {
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
}
