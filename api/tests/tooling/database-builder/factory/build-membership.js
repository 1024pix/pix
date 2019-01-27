const faker = require('faker');
const databaseBuffer = require('../database-buffer');

/*
 * /!\ We can not use standard entity builders because of bidirectional relationships (a.k.a. cyclic dependencies)
 */

function _buildOrganization(
  {
    id = faker.random.number(),
    name = faker.company.companyName(),
    type = 'PRO',
    code = 'ABCD12',
  } = {}) {

  const values = { id, type, name, code };
  databaseBuffer.pushInsertable({ tableName: 'organizations', values });
  return values;
}

function _buildOrganizationRole(
  {
    id = faker.random.number(),
    name = 'ADMIN',
  } = {}) {

  const values = { id, name };
  databaseBuffer.pushInsertable({ tableName: 'organization-roles', values });
  return values;
}

function _buildUser(
  {
    id = faker.random.number(),
    firstName = faker.name.firstName(),
    lastName = faker.name.lastName(),
    email = faker.internet.email(),
    password = faker.internet.password(),
  } = {}) {

  const values = { id, firstName, lastName, email, password };
  databaseBuffer.pushInsertable({ tableName: 'users', values });
  return values;
}

module.exports = function buildMembership(
  {
    id = faker.random.number(),
    organizationId = _buildOrganization().id,
    organizationRoleId = _buildOrganizationRole().id,
    userId = _buildUser().id,
  } = {}) {

  const values = { id, organizationId, organizationRoleId, userId };
  databaseBuffer.pushInsertable({ tableName: 'memberships', values, });
  return values;
};

