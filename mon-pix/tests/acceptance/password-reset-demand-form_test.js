import { fillIn, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Password reset demand form', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('can visit /mot-passe-oublie', async function (assert) {
    // when
    await visit('/mot-de-passe-oublie');

    // then
    assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
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

    assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
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
    const screen = await visit('/mot-de-passe-oublie');
    await fillIn('#email', 'unexisting@user.com');

    // when
    await clickByLabel(this.intl.t('pages.password-reset-demand.actions.reset'));

    // then
    assert.strictEqual(currentURL(), '/mot-de-passe-oublie');
    assert.dom(screen.getByText(this.intl.t('pages.password-reset-demand.error.message'))).exists();
  });
});
