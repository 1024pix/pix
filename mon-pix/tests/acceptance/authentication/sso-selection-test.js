import { clickByName, visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | authentication | SSO selection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When the user logs in', function () {
    test('it displays the sso selection page for login with an additional signup link', async function (assert) {
      // given
      const screen = await visit('/connexion/sso-selection');

      // when
      await clickByName(t('components.authentication.oidc-provider-selector.label'));
      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Partenaire OIDC' }));

      // then
      const heading = await screen.findByRole('heading', { name: t('pages.sign-in.first-title') });
      assert.dom(heading).exists();

      const signupLink = await screen.findByRole('link', {
        name: t('pages.authentication.sso-selection.signup.link'),
      });
      assert.dom(signupLink).exists();
    });

    test('there is a back button to the login page', async function (assert) {
      // given
      await visit('/connexion/sso-selection');

      // when
      await clickByName(t('common.actions.back'));

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When the user signs up', function () {
    test('it displays the sso selection page for signup with no additional signup link', async function (assert) {
      // given
      const screen = await visit('/inscription/sso-selection');

      // when
      await clickByName(t('components.authentication.oidc-provider-selector.label'));

      // then
      const heading = await screen.findByRole('heading', { name: t('pages.signup.first-title') });
      assert.dom(heading).exists();

      const signupLink = await screen.queryByRole('link', {
        name: t('pages.authentication.sso-selection.signup.link'),
      });
      assert.dom(signupLink).doesNotExist();
    });

    test('there is a back button to the signup page', async function (assert) {
      // given
      await visit('/inscription/sso-selection');

      // when
      await clickByName(t('common.actions.back'));

      // then
      assert.strictEqual(currentURL(), '/inscription');
    });
  });
});
