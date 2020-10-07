import { authenticateSession as emberAuthenticateSession } from 'ember-simple-auth/test-support';

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

export function createScoUserWithMembershipAndTermsOfServiceAccepted() {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'SCO-ver',
    email: 'harry@scover.com',
    'pixCertifTermsOfServiceAccepted': true,
  });

  const certificationCenter = server.create('certificationCenter', {
    name: 'Centre de certification SCO du pix',
    type: 'SCO',
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

export function authenticateSession(userId) {
  return emberAuthenticateSession({
    user_id: userId,
    access_token: 'aaa.' + btoa(`{"user_id":${userId},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });
}
