const databaseBuffer = require('../database-buffer');
const buildOrganization = require('./build-organization');
const buildUser = require('./build-user');

const buildOrganizationPlace = function buildOrganizationPlace({
  id = databaseBuffer.getNextId(),
  organizationId,
  count = 7777,
  activationDate = new Date('2014-05-13'),
  expirationDate,
  reference = 'Godzilla',
  category = 'T0',
  createdBy,
  createdAt = new Date('1997-07-01'),
  deletedBy,
  deletedAt,
} = {}) {
  organizationId = organizationId || buildOrganization().id;
  createdBy = createdBy || buildUser.withRole({ firstName: 'Gareth', lastName: 'Edwards' }).id;

  const values = {
    id,
    count,
    organizationId,
    activationDate,
    expirationDate,
    reference,
    category,
    createdBy,
    createdAt,
    deletedBy,
    deletedAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization-places',
    values,
  });
};

module.exports = buildOrganizationPlace;
