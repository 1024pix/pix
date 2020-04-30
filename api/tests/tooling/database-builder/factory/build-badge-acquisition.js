const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeAcquisition({
  id,
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
