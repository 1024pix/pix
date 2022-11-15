import { fillIn, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Reset Password', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('can visit /mot-passe-oublie', async function (assert) {
    // when
    await visit('/mot-de-passe-oublie');

    // then
    assert.equal(currentURL(), '/mot-de-passe-oublie');
  });

  test('display a form to reset the email', async function (assert) {
    // when
    await visit('/mot-de-passe-oublie');

    // then
    assert.dom('.sign-form__container').exists();
  });

  test('should stay on mot de passe oublié page, and show success message, when email sent correspond to an existing user', async function (assert) {
    // given
    this.server.create('user', {
      id: 1,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!',
    });
    await visit('/mot-de-passe-oublie');
    await fillIn('#email', 'brandone.martins@pix.com');

    // when
    await clickByLabel(this.intl.t('pages.password-reset-demand.actions.reset'));

    assert.equal(currentURL(), '/mot-de-passe-oublie');
    assert.dom('.password-reset-demand-form__body').exists();
  });

  test('should stay in mot-passe-oublie page when sent email do not correspond to any existing user', async function (assert) {
    // given
    this.server.create('user', {
      id: 1,
      firstName: 'Brandone',
      lastName: 'Martins',
      email: 'brandone.martins@pix.com',
      password: '1024pix!',
    });
    await visit('/mot-de-passe-oublie');
    await fillIn('#email', 'unexisting@user.com');

    // when
    await clickByLabel(this.intl.t('pages.password-reset-demand.actions.reset'));

    assert.equal(currentURL(), '/mot-de-passe-oublie');
    assert.dom('.sign-form__notification-message--error').exists();
  });
});
