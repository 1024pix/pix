export function createUserWithMembership() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixCertifTermsOfServiceAccepted': false });

  const certificationCenter = server.create('certificationCenter', {
    name: 'Centre de certification du pix'
  });

  const memberships = server.create('certificationCenterMembership', {
    certificationCenterId: certificationCenter.id,
    certificationCenter,
    userId: user.id
  });

  user.certificationCenterMemberships = [memberships];
  return user;
}

export function createUserWithMembershipAndTermsOfServiceAccepted() {
  const user = server.create('user', { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com', 'pixCertifTermsOfServiceAccepted': true });

  const certificationCenter = server.create('certificationCenter', {
    name: 'Centre de certification du pix'
  });

  const memberships = server.create('certificationCenterMembership', {
    certificationCenterId: certificationCenter.id,
    userId: user.id
  });

  user.certificationCenterMemberships = [memberships];
  return user;
}
