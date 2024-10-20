import { User } from '../../../../src/identity-access-management/domain/models/User.js';
import { Organization } from '../../../../src/organizational-entities/domain/models/Organization.js';
import { Membership } from '../../../../src/shared/domain/models/Membership.js';
import { UserOrgaSettings } from '../../../../src/shared/domain/models/UserOrgaSettings.js';
import { Prescriber } from '../../../../src/team/domain/read-models/Prescriber.js';

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

const buildPrescriber = function ({
  id = 753,
  firstName = 'Jean',
  lastName = 'Forme',
  pixOrgaTermsOfServiceAccepted = false,
  lang = 'fr',
  areNewYearOrganizationLearnersImported = false,
  memberships = _buildMemberships(),
  userOrgaSettings = _buildUserOrgaSettings(),
  features = {},
} = {}) {
  return new Prescriber({
    id,
    firstName,
    lastName,
    pixOrgaTermsOfServiceAccepted,
    lang,
    areNewYearOrganizationLearnersImported,
    memberships,
    userOrgaSettings,
    features,
  });
};

export { buildPrescriber };
