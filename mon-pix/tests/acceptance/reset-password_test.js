import { currentURL, fillIn, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Reset Password Form', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('can visit /changer-mot-de-passe when temporaryKey exists', async function (assert) {
    // given
    server.create('user', {
      id: 1000,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!',
    });

    server.create('password-reset-demand', {
      temporaryKey: 'temporaryKey',
      email: 'brandone.martins@pix.com',
    });

    // when
    await visit('/changer-mot-de-passe/temporaryKey');

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/changer-mot-de-passe/temporaryKey');
  });

  test('should stay on changer-mot-de-passe, and show success message, when password is successfully reset', async function (assert) {
    // given
    server.create('user', {
      id: 1000,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!',
    });

    server.create('password-reset-demand', {
      temporaryKey: 'brandone-reset-key',
      email: 'brandone.martins@pix.com',
    });

    await visit('/changer-mot-de-passe/brandone-reset-key');
    await fillIn('#password', 'newPass12345!');

    // when
    await clickByLabel(this.intl.t('pages.reset-password.actions.submit'));

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/changer-mot-de-passe/brandone-reset-key');
    assert.ok(find('.sign-form__body').textContent.includes('Votre mot de passe a été modifié avec succès'));
  });

  test('should allow connected user to visit reset-password page', async function (assert) {
    // given
    const user = server.create('user', {
      id: 1000,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!',
    });

    server.create('password-reset-demand', {
      temporaryKey: 'brandone-reset-key',
      email: 'brandone.martins@pix.com',
    });

    await authenticateByEmail(user);

    // when
    await visit('/changer-mot-de-passe/brandone-reset-key');

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), '/changer-mot-de-passe/brandone-reset-key');
  });
});
