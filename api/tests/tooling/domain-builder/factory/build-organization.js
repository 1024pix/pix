const faker = require('faker');
const Organization = require('../../../../lib/domain/models/Organization');
const User = require('../../../../lib/domain/models/User');
const Student = require('../../../../lib/domain/models/Student');

function _buildMember(
  {
    id = 1,
    firstName = 'Jean',
    lastName = 'Bono',
    email = 'jean.bono@example.net',
  } = {}) {

  return new User({ id, firstName, lastName, email });
}

function _buildStudent(
  {
    id = 1,
    lastName = 'Bono',
    firstName = 'Jean',
    birthdate = faker.date.past(2, '2009-12-31'),
    organization = null,
  } = {}) {

  return new Student({ id, lastName, firstName, birthdate, organization });
}

function buildOrganization(
  {
    id = faker.random.number(),
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    externalId = 'OrganizationIdLinksToExternalSource',
    provinceCode = '2A',
    isManagingStudents = false,
    createdAt = new Date('2018-01-12T01:02:03Z'),
    memberships = [],
    targetProfileShares = []
  } = {}) {
  return new Organization({ id, name, type, logoUrl, externalId, provinceCode, isManagingStudents, createdAt, memberships, targetProfileShares });
}

buildOrganization.withMembers = function(
  {
    id = faker.random.number(),
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    externalId = 'OrganizationIdLinksToExternalSource',
    provinceCode = '2A',
    isManagingStudents = false,
    createdAt = new Date('2018-01-12T01:02:03Z'),
    members = [
      _buildMember({ id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }),
      _buildMember({ id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' }),
    ]
  } = {}
) {
  return new Organization({ id, name, type, logoUrl, externalId, provinceCode, isManagingStudents, createdAt, members });
};

buildOrganization.withStudents = function(
  {
    id = faker.random.number(),
    name = 'Lycée Luke Skywalker',
    type = 'SCO',
    logoUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    externalId = 'OrganizationIdLinksToExternalSource',
    provinceCode = '2A',
    isManagingStudents = true,
    createdAt = new Date('2018-01-12T01:02:03Z'),
    students = []
  } = {}
) {
  const organization = new Organization({ id, name, type, logoUrl, externalId, provinceCode, isManagingStudents, createdAt, students });

  organization.students = [
    _buildStudent({ id: 1, lastName: 'Doe', firstName: 'John', organization }),
    _buildStudent({ id: 2, lastName: 'Smith', firstName: 'Jane', organization })
  ];

  return organization;
};

module.exports = buildOrganization;
