import { buildOrganization } from './build-organization.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';

const buildPix1dOrganisation = function ({ id = databaseBuffer.getNextId(), code, organizationId } = {}) {
  organizationId = _.isNil(organizationId) ? buildOrganization().id : organizationId;
  // Because of unicity constraint if no code is given we set the unique id as campaign code.
  code = _.isUndefined(code) ? id.toString() : code;

  const values = {
    id,
    code,
    organizationId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'pix1d-organizations',
    values,
  });
};

export { buildPix1dOrganisation };
