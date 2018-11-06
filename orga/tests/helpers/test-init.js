export function createUserWithMembership() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': false });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates'
  });

  const memberships = server.create('membership', {
    organizationId: organization.id,
    userId: user.id
  });

  user.memberships = [memberships];
  return user;
}

export function createUserWithMembershipAndTermsOfServiceAccepted() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixOrgaTermsOfServiceAccepted': true });

  const organization = server.create('organization', {
    name: 'BRO & Evil Associates'
  });

  const memberships = server.create('membership', {
    organizationId: organization.id,
    userId: user.id
  });

  user.memberships = [memberships];
  return user;
}
