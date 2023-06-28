import { Membership } from '../../../../lib/shared/domain/models/Membership.js';
import { Organization } from '../../../../lib/shared/domain/models/Organization.js';
import { User } from '../../../../lib/shared/domain/models/User.js';
import { UserOrgaSettings } from '../../../../lib/shared/domain/models/UserOrgaSettings.js';
import { Prescriber } from '../../../../lib/shared/domain/read-models/Prescriber.js';

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
  enableMultipleSendingAssessment = false,
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
    enableMultipleSendingAssessment,
  });
};

export { buildPrescriber };
