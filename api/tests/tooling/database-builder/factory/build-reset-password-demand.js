const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildResetPasswordDemand({
  id,
  email = faker.internet.exampleEmail().toLowerCase(),
  temporaryKey = faker.random.alphaNumeric(9),
  used = false,
} = {}) {

  const values = {
    id,
    email,
    temporaryKey,
    used,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'reset-password-demands',
    values,
  });
};
