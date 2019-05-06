const buildUser = require('./build-user');
const buildPixRole = require('./build-pix-role');
const databaseBuffer = require('../database-buffer');
const faker = require('faker');
const _ = require('lodash');

const buildUserPixRole = function buildUserPixRole({
  id = faker.random.number(),
  userId,
  pixRoleId,
} = {}) {

  userId = _.isNil(userId) ? buildUser().id : userId;
  pixRoleId = _.isNil(pixRoleId) ? buildPixRole().id : pixRoleId;

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
