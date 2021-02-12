const Organization = require('../../../../lib/domain/models/Organization');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');

function _buildSchoolingRegistration({
  id = 1,
  lastName = 'Bono',
  firstName = 'Jean',
  birthdate = '2001-01-01',
  organization = null,
} = {}) {

  return new SchoolingRegistration({ id, lastName, firstName, birthdate, organization });
}

function buildOrganization({
  id = 123,
  name = 'Lycée Luke Skywalker',
  type = 'SCO',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = 'OrganizationIdLinksToExternalSource',
  provinceCode = '2A',
  isManagingStudents = false,
  credit = 500,
  canCollectProfiles = false,
  email = 'jesuistonpere@example.net',
  createdAt = new Date('2018-01-12T01:02:03Z'),
  targetProfileShares = [],
  tags = [],
} = {}) {
  return new Organization({ id, name, type, logoUrl, externalId, provinceCode, isManagingStudents, credit, email, canCollectProfiles, createdAt, targetProfileShares, tags });
}

buildOrganization.withSchoolingRegistrations = function({
  id = 123,
  name = 'Lycée Luke Skywalker',
  type = 'SCO',
  logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
  externalId = 'OrganizationIdLinksToExternalSource',
  provinceCode = '2A',
  isManagingStudents = true,
  credit = 500,
  canCollectProfiles = false,
  createdAt = new Date('2018-01-12T01:02:03Z'),
  students = [],
} = {},
) {
  const organization = new Organization({ id, name, type, logoUrl, externalId, provinceCode, isManagingStudents, credit, canCollectProfiles, createdAt, students });

  organization.students = [
    _buildSchoolingRegistration({ id: 1, lastName: 'Doe', firstName: 'John', organization }),
    _buildSchoolingRegistration({ id: 2, lastName: 'Smith', firstName: 'Jane', organization }),
  ];

  return organization;
};

module.exports = buildOrganization;
