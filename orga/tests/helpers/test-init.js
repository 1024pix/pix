import QUnit from 'qunit';
import { contains, notContains } from './contains';

QUnit.assert.contains = contains;
QUnit.assert.notContains = notContains;

export function createPrescriberByUser(user, participantCount = 0) {
  const prescriber = server.create('prescriber', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    lang: user.lang,
    pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
    memberships: user.memberships,
    userOrgaSettings: user.userOrgaSettings,
    participantCount,
    features: {
      MULTIPLE_SENDING_ASSESSMENT: false,
      COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY: false,
    },
  });

  return prescriber;
}

export function createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceAccepted }) {
  const firstName = 'Harry';
  const lastName = 'Cover';
  const email = 'harry@cover.com';
  const lang = 'fr';

  const user = server.create('user', { firstName, lastName, email, lang, pixOrgaTermsOfServiceAccepted });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
  });

  const membership = server.create('membership', {
    organizationId: organization.id,
    userId: user.id,
  });

  const userOrgaSettings = server.create('user-orga-setting', { user, organization });

  return server.create('prescriber', {
    id: user.id,
    firstName,
    lastName,
    lang,
    pixOrgaTermsOfServiceAccepted,
    memberships: [membership],
    userOrgaSettings: userOrgaSettings,
    features: { MISSIONS_MANAGEMENT: false },
  });
}

function _addUserToOrganization(user, { externalId } = {}) {
  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
    externalId,
  });

  const memberships = server.create('membership', {
    organizationId: organization.id,
    userId: user.id,
  });

  user.userOrgaSettings = server.create('user-orga-setting', { user, organization });
  user.memberships = [memberships];
  return user;
}

export function createUserWithMembership() {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixOrgaTermsOfServiceAccepted: false,
  });

  return _addUserToOrganization(user);
}

export function createUserWithMembershipAndTermsOfServiceAccepted() {
  const user = server.create('user', {
    id: 7,
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixOrgaTermsOfServiceAccepted: true,
  });
  server.create('member-identity', { id: user.id, firstName: 'Harry', lastName: 'Cover' });
  return _addUserToOrganization(user, { externalId: 'EXTBRO' });
}

export function createUserMembershipWithRole(organizationRole) {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixOrgaTermsOfServiceAccepted: true,
  });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
    documentationUrl: 'https://pix.fr',
  });

  const memberships = server.create('membership', {
    userId: user.id,
    organizationId: organization.id,
    organizationRole,
  });

  user.userOrgaSettings = server.create('user-orga-setting', { user, organization });
  user.memberships = [memberships];

  return user;
}

export function createUserWithMultipleMemberships() {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixOrgaTermsOfServiceAccepted: true,
  });

  const firstOrganization = server.create('organization', {
    name: 'BRO & Evil Associates',
    externalId: 'EXTBRO',
  });

  const secondOrganization = server.create('organization', {
    name: 'My Heaven Company',
    externalId: 'HEAVEN',
    type: 'SCO',
    isManagingStudents: true,
  });

  const firstMembership = server.create('membership', {
    organizationId: firstOrganization.id,
    userId: user.id,
  });

  const secondMembership = server.create('membership', {
    organizationId: secondOrganization.id,
    userId: user.id,
  });

  user.memberships = [firstMembership, secondMembership];
  user.userOrgaSettings = server.create('user-orga-setting', { organization: firstOrganization, user });

  return user;
}

export function createPrescriberForOrganization(userAttributes = {}, organizationAttributes = {}, organizationRole) {
  const user = server.create('user', { ...userAttributes, pixOrgaTermsOfServiceAccepted: true });

  const organization = server.create('organization', organizationAttributes);

  const membership = server.create('membership', {
    organizationId: organization.id,
    userId: user.id,
    organizationRole,
  });

  user.memberships = [membership];
  user.userOrgaSettings = server.create('user-orga-setting', { organization, user });

  createPrescriberByUser(user);
  return user;
}

export function createMembershipByOrganizationIdAndUser(organizationId, user, role = 'MEMBER') {
  const membership = server.create('membership', {
    userId: user.id,
    organizationId,
    role,
  });

  user.memberships = [membership];

  return user;
}

export function createAdmin() {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixOrgaTermsOfServiceAccepted: true,
  });
  const organization = server.create('organization', { name: 'BRO & Evil Associates' });

  const membership = server.create('membership', {
    organizationId: organization.id,
    userId: user.id,
    organizationRole: 'ADMIN',
  });
  user.memberships = [membership];

  const userOrgaSettings = server.create('user-orga-setting', { user, organization });

  const prescriber = server.create('prescriber', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    lang: user.lang,
    pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
    memberships: user.memberships,
    userOrgaSettings: user.userOrgaSettings,
  });

  return { user, organization, membership, userOrgaSettings, prescriber };
}

export function createMember() {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixOrgaTermsOfServiceAccepted: true,
  });
  server.create('member-identity', { id: user.id, firstName: 'Harry', lastName: 'Cover' });
  const organization = server.create('organization', { name: 'BRO & Evil Associates' });

  const membership = server.create('membership', {
    organizationId: organization.id,
    userId: user.id,
    organizationRole: 'MEMBER',
  });
  user.memberships = [membership];

  const userOrgaSettings = server.create('user-orga-setting', { user, organization });

  const prescriber = server.create('prescriber', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    lang: user.lang,
    pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
    memberships: user.memberships,
    userOrgaSettings: user.userOrgaSettings,
    features: { MISSIONS_MANAGEMENT: false },
  });

  return { user, organization, membership, userOrgaSettings, prescriber };
}

export function createUserManagingStudents(role = 'MEMBER', type = 'SCO') {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    lang: 'fr',
    pixOrgaTermsOfServiceAccepted: true,
  });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
    type,
    isManagingStudents: true,
    documentationUrl: 'https://pix.fr',
  });

  const memberships = server.create('membership', {
    userId: user.id,
    organizationId: organization.id,
    organizationRole: role,
  });

  user.userOrgaSettings = server.create('user-orga-setting', { user, organization });
  user.memberships = [memberships];
  return user;
}
