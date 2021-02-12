const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeAcquisition({
  id = databaseBuffer.getNextId(),
  badgeId,
  userId,
} = {}) {

  return databaseBuffer.pushInsertable({
    tableName: 'badge-acquisitions',
    values: {
      id,
      badgeId,
      userId,
    },
  });
};
