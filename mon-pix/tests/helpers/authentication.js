import { fillIn, click } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateSession } from 'ember-simple-auth/test-support';

export async function authenticate(user) {
  return authenticateSession({
    user_id: user.id,
    access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
    expires_in: 3600,
    token_type: 'Bearer token type',
  });
}

export async function authenticateByEmail(user) {
  const screen = await visit('/connexion');
  await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), user.email);
  await fillIn(screen.getByLabelText('Mot de passe'), user.password);
  await click(screen.getByRole('button', { name: 'Je me connecte' }));
  return screen;
}

export async function authenticateByUsername(user) {
  const screen = await visit('/connexion');
  await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), user.username);
  await fillIn(screen.getByLabelText('Mot de passe'), user.password);
  await click(screen.getByRole('button', { name: 'Je me connecte' }));
  return screen;
}

export function generateGarAuthenticationURLHash(user) {
  return '#aaa.' + btoa(`{"user_id":${user.id},"source":"external","iat":1545321469,"exp":4702193958}`) + '.bbb';
}

export async function authenticateByGAR(user) {
  await visit('/connexion/gar' + generateGarAuthenticationURLHash(user));
}

export async function logout() {
  await visit('/deconnexion');
}
