const databaseBuffer = require('../database-buffer');

const buildFeature = function buildFeature({ id = databaseBuffer.getNextId(), key, description } = {}) {
  const values = {
    id,
    key,
    description,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'features',
    values,
  });
};

module.exports = buildFeature;
