const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const encrypt = require('../../../../lib/domain/services/encryption-service');
const buildPixRole = require('./build-pix-role');
const buildUserPixRole = require('./build-user-pix-role');
const buildOrganization = require('./build-organization');
const buildOrganizationRole = require('./build-organization-role');
const buildMembership = require('./build-membership');

const buildUser = function buildUser({
  id = faker.random.number(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
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

buildUser.withPixRolePixMaster = function buildUserWithPixRolePixMaster({
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

  const pixRolePixMaster = buildPixRole({ id: 1, name: 'PIX_MASTER' });

  buildUserPixRole({ userId: id, pixRoleId: pixRolePixMaster.id });

  databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  return values;
};

buildUser.withMembership = function buildUserWithMemberships({
  id = faker.random.number(),
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.email(),
  password = 'encrypt.hashPasswordSync(faker.internet.password())',
  cgu = true,
  organizationId = null,
  organizationRoleId = null
} = {}) {

  const values = {
    id, firstName, lastName, email, password, cgu,
  };

  const _organizationId = organizationId || buildOrganization({ name: faker.company.name() }).id;

  const _organizationRoleId = organizationRoleId || buildOrganizationRole({ name: 'ADMIN' }).id;

  buildMembership({ 
    userId: id, 
    organizationId: _organizationId, 
    organizationRoleId: _organizationRoleId
  });
  
  databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  return values;
};

module.exports = buildUser;
