export function createUserWithOrganizationAccess() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': false });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates'
  });

  const organizationAccess = server.create('organization-access', {
    organizationId: organization.id,
    userId: user.id
  });

  user.organizationAccesses = [organizationAccess];
  return user;
}

export function createUserWithOrganizationAccessAndTermsOfServiceAccepted() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates'
  });

  const organizationAccess = server.create('organization-access', {
    organizationId: organization.id,
    userId: user.id
  });

  user.organizationAccesses = [organizationAccess];
  return user;
}
