import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | certification-information', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user accesses to v3 certification information page', function () {
    test('should display the first page information', async function (assert) {
      // given
      // when
      const screen = await render(hbs`<CertificationInformation/>`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Bienvenue à la certification Pix', level: 2 })).exists();
      assert.dom(screen.getByRole('button', { name: "Continuer vers l'écran suivant" })).exists();
    });

    module('on first page', function () {
      test('should not display the previous button', async function (assert) {
        // given
        // when
        const screen = await render(hbs`<CertificationInformation/>`);

        // then
        assert.dom(screen.queryByRole('button', { name: "Revenir vers l'écran précédent" })).doesNotExist();
      });
    });

    module('on all pages except the first', function () {
      test('should display the previous button', async function (assert) {
        // given
        const screen = await render(hbs`<CertificationInformation/>`);

        // when
        await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));

        // then
        assert.dom(screen.getByRole('button', { name: "Revenir vers l'écran précédent" })).exists();
      });
    });

    module('on the last page', function () {
      test('should change the continue aria label button', async function (assert) {
        // given
        const screen = await render(hbs`<CertificationInformation/>`);

        // when
        for (let i = 0; i < 4; i++) {
          await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));
        }

        // then
        assert.dom(screen.getByRole('button', { name: "Continuer vers la page d'entrée en certification" })).exists();
      });

      test('should disable the continue button', async function (assert) {
        // given
        const screen = await render(hbs`<CertificationInformation/>`);

        // when
        for (let i = 0; i < 4; i++) {
          await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));
        }

        // then
        assert
          .dom(screen.getByRole('button', { name: "Continuer vers la page d'entrée en certification" }))
          .isDisabled();
      });
    });
  });
});
