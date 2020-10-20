import { authenticateSession as emberAuthenticateSession } from 'ember-simple-auth/test-support';

export function createUserAndMembership(pixCertifTermsOfServiceAccepted = false, certificationCenterType, certificationCenterName = 'Centre de certification du pix') {
  const user = server.create('user', {
    firstName: 'Harry',
    lastName: 'Cover',
    email: 'harry@cover.com',
    pixCertifTermsOfServiceAccepted,
  });

  const certificationCenter = server.create('certificationCenter', {
    name: certificationCenterName,
    type: certificationCenterType,
  });

  const certificationCenterMembership = server.create('certificationCenterMembership', {
    certificationCenter,
    user,
  });

  user.certificationCenterMemberships = [certificationCenterMembership];
  user.save();

  return { user, certificationCenter };
}

export function createScoUserWithMembershipAndTermsOfServiceAccepted() {
  return createUserWithMembershipAndTermsOfServiceAccepted('SCO' , 'Centre de certification SCO du pix');
}

export function createUserAndMembershipAndTermsOfServiceAccepted(certificationCenterType = undefined, certificationCenterName = 'Centre de certification du pix') {
  return createUserAndMembership(true, certificationCenterType , certificationCenterName);
}

export function createUserWithMembershipAndTermsOfServiceAccepted(certificationCenterType = undefined, certificationCenterName = 'Centre de certification du pix') {
  const { user } = createUserAndMembership(true, certificationCenterType , certificationCenterName);
  return user;
}
export function createUserWithMembershipAndTermsOfServiceNotAccepted() {
  const { user } = createUserAndMembership(false);
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
