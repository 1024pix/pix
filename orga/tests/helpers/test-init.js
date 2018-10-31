export function createUserWithMembership() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': false });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates'
  });

  const organizationAccess = server.create('membership', {
    organizationId: organization.id,
    userId: user.id
  });

  user.memberships = [organizationAccess];
  return user;
}

export function createUserWithMembershipAndTermsOfServiceAccepted() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates'
  });

  const organizationAccess = server.create('membership', {
    organizationId: organization.id,
    userId: user.id
  });

  user.memberships = [organizationAccess];
  return user;
}
