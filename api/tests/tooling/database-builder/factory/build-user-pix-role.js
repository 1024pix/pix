const buildUser = require('./build-user');
const buildPixRole = require('./build-pix-role');

const faker = require('faker');
const databaseBuffer = require('../database-buffer');

const buildUserPixRole = function buildUserPixRole({
  id = faker.random.number(),
  userId = buildUser().id,
  pixRoleId = buildPixRole().id
} = {}) {

  const values = {
    id, userId, pixRoleId,
  };

  databaseBuffer.pushInsertable({
    tableName: 'users_pix_roles',
    values: {
      id,
      'user_id': userId,
      'pix_role_id': pixRoleId
    },
  });

  return values;
};

module.exports = buildUserPixRole;
