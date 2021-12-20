const databaseBuffer = require('../database-buffer');
const _ = require('lodash');
const buildUser = require('./build-user');
const buildSession = require('./build-session');

module.exports = function buildSupervisorAccess({
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
