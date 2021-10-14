import { fillIn } from '@ember/test-helpers';
import visit from './visit';
import { clickByLabel } from './click-by-label';

export async function authenticateByEmail(user) {
  await visit('/connexion');
  await fillIn('#login', user.email);
  await fillIn('#password', user.password);
  await clickByLabel('Je me connecte');
}

export async function authenticateByUsername(user) {
  await visit('/connexion');
  await fillIn('#login', user.username);
  await fillIn('#password', user.password);
  await clickByLabel('Je me connecte');
}

export async function authenticateByGAR(user) {
  await visit(
    '/?token=aaa.' + btoa(`{"user_id":${user.id},"source":"external","iat":1545321469,"exp":4702193958}`) + '.bbb'
  );
}

export async function logout() {
  await visit('/deconnexion');
}
