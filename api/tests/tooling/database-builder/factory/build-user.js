const faker = require('faker');
const databaseBuffer = require('../database-buffer');
const encrypt = require('../../../../lib/domain/services/encryption-service');
const buildPixRole = require('./build-pix-role');
const buildUserPixRole = require('./build-user-pix-role');
const buildOrganization = require('./build-organization');
const buildOrganizationRole = require('./build-organization-role');
const buildMembership = require('./build-membership');
const _ = require('lodash');

const buildUser = function buildUser({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.exampleEmail().toLowerCase(),
  password = encrypt.hashPasswordSync(faker.internet.password()),
  cgu = true,
} = {}) {

  const values = {
    id, firstName, lastName, email, password, cgu,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
};

buildUser.withUnencryptedPassword = function buildUserWithUnencryptedPassword({
  id,
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

  return databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });
};

buildUser.withPixRolePixMaster = function buildUserWithPixRolePixMaster({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  email = faker.internet.email(),
  password = encrypt.hashPasswordSync(faker.internet.password()),
  cgu = true,
} = {}) {

  const values = {
    id, firstName, lastName, email, password, cgu,
  };

  const pixRolePixMaster = buildPixRole({ name: 'PIX_MASTER' });

  const user = databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  return values;
};

buildUser.withMembership = function buildUserWithMemberships({
  id,
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

  organizationId = _.isNil(organizationId) ? buildOrganization({ name: faker.companyName() }).id : organizationId;
  organizationRoleId = _.isNil(organizationRoleId) ? buildOrganizationRole({ name: 'ADMIN' }).id : organizationRoleId;

  buildMembership({ 
    userId: id, 
    organizationId,
    organizationRoleId
  });
  
  databaseBuffer.pushInsertable({
    tableName: 'users',
    values,
  });

  return values;
};

module.exports = buildUser;
