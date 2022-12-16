import { authenticateSession } from 'ember-simple-auth/test-support';

export async function createAuthenticateSession({ userId }) {
  return authenticateSession({
    user_id: userId,
    access_token: 'aaa.' + btoa(`{"user_id":${userId},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });
}

export function authenticateAdminMemberWithRole({ isSuperAdmin, isCertif, isSupport, isMetier } = {}) {
  return async (server) => {
    const user = server.create('user');
    server.create('admin-member', { isSuperAdmin, isCertif, isSupport, isMetier, userId: user.id });
    await createAuthenticateSession({ userId: user.id });
    return user;
  };
}
