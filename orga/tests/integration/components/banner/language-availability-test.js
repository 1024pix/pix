import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Banner::LanguageAvailability', function (hooks) {
  setupIntlRenderingTest(hooks);

  let session;

  hooks.beforeEach(function () {
    session = this.owner.lookup('service:session');
  });

  module('when user language is available', function () {
    test('does not display the language availability banner', async function (assert) {
      // given
      session.data.localeNotSupported = false;
      session.data.localeNotSupportedBannerClosed = false;

      // when
      const screen = await render(hbs`<Banner::LanguageAvailability />`);

      // then
      assert.dom(screen.queryByRole('alert')).doesNotExist();
    });
  });

  module('when user language is not available', function (hooks) {
    hooks.beforeEach(function () {
      session.data.localeNotSupported = true;
    });

    module('when the user has not closed the banner', function () {
      test('displays the language availability banner', async function (assert) {
        // given
        session.data.localeNotSupportedBannerClosed = false;

        // when
        const screen = await render(hbs`<Banner::LanguageAvailability />`);

        // then
        assert
          .dom(
            screen.getByText(
              `Votre langue n'est pas encore disponible sur Pix Orga. Pour votre confort, l'application sera présentée en anglais. Toute l'équipe de Pix travaille à l'ajout de votre langue.`,
            ),
          )
          .exists();
      });

      module('when user close the language availability banner', function () {
        test('closes the language availability banner', async function (assert) {
          // given
          session.data.localeNotSupportedBannerClosed = false;
          const screen = await render(hbs`<Banner::LanguageAvailability />`);

          // when
          await clickByName('Fermer');

          // then
          assert.dom(screen.queryByRole('alert')).doesNotExist();
        });
      });
    });

    module('when the user has closed the banner', function () {
      test('does not display the language availability banner', async function (assert) {
        // given
        session.data.localeNotSupportedBannerClosed = true;

        // when
        const screen = await render(hbs`<Banner::LanguageAvailability />`);

        // then
        assert.dom(screen.queryByRole('alert')).doesNotExist();
      });
    });
  });
});
