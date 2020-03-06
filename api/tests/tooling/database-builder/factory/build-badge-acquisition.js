const databaseBuffer = require('../database-buffer');

module.exports = function buildBadgeAcquisition({
  id,
  badgeId,
  userId,
} = {}) {

  const values = {
    id,
    badgeId,
    userId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'badge-acquisitions',
    values,
  });
};
