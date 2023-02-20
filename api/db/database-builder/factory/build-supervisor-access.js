import databaseBuffer from '../database-buffer';
import _ from 'lodash';
import buildUser from './build-user';
import buildSession from './build-session';

export default function buildSupervisorAccess({
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
}
