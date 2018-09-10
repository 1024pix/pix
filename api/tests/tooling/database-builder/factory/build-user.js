const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const encrypt = require('../../../../lib/domain/services/encryption-service');

const buildUser = function buildUser({
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

buildUser.withUnencryptedPassword = function buildUserWithUnencryptedPassword({
  id = faker.random.number(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.email(),
  rawPassword = faker.internet.password(),
  cgu = true,
}) {

  const password = encrypt.hashPasswordSync(rawPassword);

  const values = {
    id, firstName, lastName, email, password, cgu,
  };

  databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  return values;
};

module.exports = buildUser;
