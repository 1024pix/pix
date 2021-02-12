const Membership = require('../../../../lib/domain/models/Membership');
const Organization = require('../../../../lib/domain/models/Organization');
const User = require('../../../../lib/domain/models/User');
const UserOrgaSettings = require('../../../../lib/domain/models/UserOrgaSettings');
const Prescriber = require('../../../../lib/domain/read-models/Prescriber');

/*
 * /!\ We can not use standard entity builders because of bidirectional relationships (a.k.a. cyclic dependencies)
 */

function _buildUser() {
  return new User({
    id: 123,
    firstName: 'Coucou',
    lastName: 'Cémoi',
  });
}

function _buildOrganization() {
  return new Organization({
    id: 456,
    name: 'ACME',
    type: 'PRO',
    externalId: 'EXTID',
    isManagingStudents: false,
    canCollectProfiles: false,
  });
}

function _buildMemberships() {
  return [
    new Membership({
      id: 789,
      user: _buildUser(),
      organization: _buildOrganization(),
    }),
  ];
}

function _buildUserOrgaSettings() {
  return new UserOrgaSettings({
    id: 159,
    currentOrganization: _buildOrganization(),
    user: _buildUser(),
  });
}

module.exports = function buildPrescriber({
  id = 753,
  firstName = 'Jean',
  lastName = 'Forme',
  pixOrgaTermsOfServiceAccepted = false,
  lang = 'fr',
  areNewYearSchoolingRegistrationsImported = false,
  memberships = _buildMemberships(),
  userOrgaSettings = _buildUserOrgaSettings(),
} = {}) {

  return new Prescriber({
    id, firstName, lastName,
    pixOrgaTermsOfServiceAccepted,
    lang,
    areNewYearSchoolingRegistrationsImported,
    memberships, userOrgaSettings,
  });
};
