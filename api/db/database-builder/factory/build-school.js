import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildOrganization } from './build-organization.js';

const buildSchool = function ({
  id = databaseBuffer.getNextId(),
  code,
  organizationId,
  sessionExpirationDate = null,
} = {}) {
  organizationId = _.isNil(organizationId) ? buildOrganization({ type: 'SCO-1D' }).id : organizationId;
  // Because of unicity constraint if no code is given we set the unique id as campaign code.
  code = _.isUndefined(code) ? id.toString() : code;

  const values = {
    id,
    code,
    organizationId,
    sessionExpirationDate,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'schools',
    values,
  });
};

export { buildSchool };
