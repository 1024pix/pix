const databaseBuffer = require('../database-buffer');

const buildPixRole = function buildPixRole({
  id,
  name = 'PIX_MASTER',
} = {}) {

  const values = {
    id,
    name,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'pix_roles',
    values,
  });
};

module.exports = buildPixRole;
