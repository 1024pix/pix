const faker = require('faker');
const databaseBuffer = require('../database-buffer');

const buildPixRole = function buildPixRole({
  id = faker.random.number(),
  name = 'PIX_MASTER',
} = {}) {

  const values = {
    id, name,
  };

  databaseBuffer.pushInsertable({
    tableName: 'pix_roles',
    values,
  });

  return values;
};

module.exports = buildPixRole;
