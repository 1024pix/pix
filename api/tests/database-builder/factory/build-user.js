const databaseBuffer = require('../database-buffer');
const faker = require('faker');
const encrypt = require('../../../lib/domain/services/encryption-service');

module.exports = function buildUser({
  id = faker.random.number(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.email(),
  password = encrypt.hashPasswordSync(faker.internet.password()),
  cgu = true,
} = {}) {

  const values = {
    id, firstName, lastName, email, password, cgu,
  };

  databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  return values;
};

