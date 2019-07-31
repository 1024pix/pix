const faker = require('faker');
const buildOrganization = require('./build-organization');
const buildUser = require('./build-user');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildStudent({
  id,
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  birthdate = faker.date.past(2, '2009-12-31'),
  organizationId,
  userId,
} = {}) {
  organizationId = _.isUndefined(organizationId) ? buildOrganization().id : organizationId;
  userId = _.isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id, firstName, lastName, birthdate, organizationId, userId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'students',
    values,
  });
};
