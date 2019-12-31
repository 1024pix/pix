export function createUserWithMembership() {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    'pixCertifTermsOfServiceAccepted': false,
  });
  const certificationCenter = server.create('certificationCenter', {
    name: 'Centre de certification du pix',
  });
  const certificationCenterMembership = server.create('certificationCenterMembership', {
    certificationCenter,
    user,
  });
  user.certificationCenterMemberships = [certificationCenterMembership];
  user.save();

  return user;
}

export function createUserWithMembershipAndTermsOfServiceAccepted() {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    'pixCertifTermsOfServiceAccepted': true,
  });
  const certificationCenter = server.create('certificationCenter', {
    name: 'Centre de certification du pix',
  });
  const certificationCenterMembership = server.create('certificationCenterMembership', {
    certificationCenter,
    user,
  });
  user.certificationCenterMemberships = [certificationCenterMembership];
  user.save();

  return user;
}
