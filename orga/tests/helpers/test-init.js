import QUnit from 'qunit';
import { contains, notContains } from './contains';

QUnit.assert.contains = contains;
QUnit.assert.notContains = notContains;

export function createPrescriberByUser(user) {
  const prescriber = server.create('prescriber', {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    pixOrgaTermsOfServiceAccepted: user.pixOrgaTermsOfServiceAccepted,
    memberships: user.memberships,
    userOrgaSettings: user.userOrgaSettings,
  });

  return prescriber;
}

export function createPrescriberWithPixOrgaTermsOfService({ pixOrgaTermsOfServiceAccepted }) {
  const firstName = 'Harry';
  const lastName = 'Cover';
  const email = 'harry@cover.com';

  const user = server.create('user', { firstName, lastName, email, pixOrgaTermsOfServiceAccepted });

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
    pixOrgaTermsOfServiceAccepted,
    memberships: [membership],
    userOrgaSettings: userOrgaSettings,
  });
}

function _addUserToOrganization(user, { externalId, canCollectProfiles } = {}) {
  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
    externalId,
    canCollectProfiles,
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
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': false });

  return _addUserToOrganization(user);
}

export function createUserWithMembershipAndTermsOfServiceAccepted() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });
  return _addUserToOrganization(user, { externalId: 'EXTBRO' });
}

export function createUserThatCanCollectProfiles() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });
  return _addUserToOrganization(user, { canCollectProfiles: true });
}

export function createUserMembershipWithRole(organizationRole) {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
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
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });

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
  const user = server.create('user', { ...userAttributes, 'pixOrgaTermsOfServiceAccepted': true });

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

export function createAdminMembershipWithNbMembers(countMembers) {

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
  });

  const admin = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    pixOrgaTermsOfServiceAccepted: true,
  });

  const adminMemberships = server.create('membership', {
    userId: admin.id,
    organizationId: organization.id,
    organizationRole: 'ADMIN',
  });

  admin.userOrgaSettings = server.create('user-orga-setting', { user: admin, organization });
  admin.memberships = [adminMemberships];

  server.createList('user', countMembers)
    .forEach((user) => {
      server.create('membership', {
        userId: user.id,
        organizationId: organization.id,
        organizationRole: 'MEMBER',
      });
    });

  return admin;
}

export function createUserManagingStudents(role = 'MEMBER', type = 'SCO') {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates',
    type,
    isManagingStudents: true,
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
