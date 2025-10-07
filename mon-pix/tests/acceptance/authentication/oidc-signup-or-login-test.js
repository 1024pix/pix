import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Login or register oidc', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when on international domain (.org)', function () {
    module('when accessing "oidc-signup-or-login" page', function () {
      test('displays the page with "Français" as selected language', async function (assert) {
        // when
        const screen = await visit('/connexion/oidc?identityProviderSlug=oidc-partner');

        // then
        assert.dom(screen.getByRole('button', { name: 'Sélectionnez une langue' })).exists();
      });
    });

    module('when user select "English" as his language', function () {
      test('displays the page with "English" as selected language', async function (assert) {
        // given
        const screen = await visit('/connexion/oidc?identityProviderSlug=oidc-partner');

        // when
        await click(screen.getByRole('button', { name: 'Sélectionnez une langue' }));
        await screen.findByRole('listbox');
        await click(screen.getByRole('option', { name: 'English' }));

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: t('pages.oidc-signup-or-login.signup-form.title'),
              level: 2,
            }),
          )
          .exists();
        assert.dom(screen.getByRole('button', { name: 'Select a language' })).exists();
      });
    });
  });
});
