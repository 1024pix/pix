import { authenticateSession } from 'ember-simple-auth/test-support';
import faker from 'faker';

export function createUser() {
  return server.create('user', { 
    firstName: faker.fake('{{name.firstName}}'),
    lastName: faker.fake('{{name.lastName}}'),
    email: faker.internet.exampleEmail()
  });
}

export async function createAuthenticateSession({ userId }) {
  return authenticateSession({
    user_id: userId,
    access_token: 'aaa.' + btoa(`{"user_id":${userId},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });
}
