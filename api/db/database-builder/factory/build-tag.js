const databaseBuffer = require('../database-buffer');

module.exports = function buildTag({
  id = databaseBuffer.getNextId(),
  name = 'Tag',
} = {}) {

  const values = {
    id,
    name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'tags',
    values,
  });
};
