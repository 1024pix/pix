import _ from 'lodash';

import { databaseBuffer } from '../database-buffer.js';
import { buildSession } from './build-session.js';
import { buildUser } from './build-user.js';

const buildSupervisorAccess = function ({
  id = databaseBuffer.getNextId(),
  sessionId,
  userId,
  authorizedAt = new Date('2020-01-01'),
} = {}) {
  userId = _.isUndefined(userId) ? buildUser().id : userId;
  sessionId = _.isUndefined(sessionId) ? buildSession().id : sessionId;
  const values = {
    id,
    userId,
    sessionId,
    authorizedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'supervisor-accesses',
    values,
  });
};

export { buildSupervisorAccess };
