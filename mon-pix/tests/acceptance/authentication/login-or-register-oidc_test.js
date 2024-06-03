import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Login or register oidc', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when on international domain (.org)', function () {
    module('when accessing "login-or-register-oidc" page', function () {
      test('displays the page with "Français" as selected language', async function (assert) {
        // when
        const screen = await visit('/connexion/oidc-partner?code=oidc_example_code&state=auth_session_state');

        // then
        assert.strictEqual(
          currentURL(),
          '/connexion/oidc?authenticationKey=key&familyName=PIX&givenName=test&identityProviderSlug=oidc-partner',
        );
        assert.dom(screen.getByRole('button', { name: 'Sélectionnez une langue' })).exists();
      });
    });

    module('when user select "English" as his language', function () {
      test('displays the page with "English" as selected language', async function (assert) {
        // given
        const screen = await visit('/connexion/oidc-partner?code=oidc_example_code&state=auth_session_state');

        // when
        await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'English' }));

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: this.intl.t('pages.login-or-register-oidc.register-form.title'),
              level: 2,
            }),
          )
          .exists();
        assert.dom(screen.getByRole('button', { name: 'Select a language' })).exists();
      });
    });
  });
});
