const databaseBuffer = require('../database-buffer');

module.exports = function buildTargetProfileTemplate({ id = databaseBuffer.getNextId() } = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'target-profile-templates',
    values: { id },
  });
};
