import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | steps', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user accesses to v3 certification instructions page', function () {
    module('on first page', function () {
      test('should display instructions', async function (assert) {
        // given
        // when
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);

        // then
        assert.dom(screen.getByRole('heading', { name: 'Bienvenue à la certification Pix', level: 2 })).exists();
        assert
          .dom(screen.getByRole('heading', { name: 'Comment fonctionne le test de certification ?', level: 3 }))
          .exists();
        assert.dom(screen.getByRole('button', { name: "Continuer vers l'écran suivant" })).exists();
      });

      test('should not display the previous button', async function (assert) {
        // given
        // when
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);

        // then
        assert.dom(screen.queryByRole('button', { name: "Revenir vers l'écran précédent" })).doesNotExist();
      });
    });

    module('on second page', function () {
      test('should display instructions', async function (assert) {
        // given
        // when
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);
        await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));

        // then
        assert
          .dom(screen.getByRole('heading', { name: 'Comment se passe le test de certification ?', level: 2 }))
          .exists();
        assert.dom(screen.getByRole('heading', { name: 'Le nombre de questions ?', level: 3 })).exists();
        assert.dom(screen.getByRole('heading', { name: 'La durée du test ?', level: 3 })).exists();
        const images = screen.getAllByRole('img');
        assert.strictEqual(
          images[0].getAttribute('src'),
          '/images/illustrations/certification-instructions-steps/clock.svg',
        );
      });
    });

    module('on third page', function () {
      test('should display instructions', async function (assert) {
        // given
        // when
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);
        await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));
        await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));

        // then
        assert.dom(screen.getByRole('heading', { name: 'Deux modes de questions', level: 2 })).exists();
        const images = screen.getAllByRole('img');
        assert.strictEqual(
          images[0].getAttribute('src'),
          '/images/illustrations/certification-instructions-steps/regular-challenge-round.svg',
        );
        assert.strictEqual(
          images[1].getAttribute('src'),
          '/images/illustrations/certification-instructions-steps/focus-challenge-round.svg',
        );
        assert.dom(screen.getByText('Le mode libre :')).exists();
        assert.dom(screen.getByText('Le mode focus :')).exists();
      });
    });

    module('on fourth page', function () {
      test('should display instructions', async function (assert) {
        // given
        // when
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);
        for (let i = 0; i < 3; i++) {
          await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));
        }

        // then
        assert.dom(screen.getByRole('heading', { name: 'Que faire en cas de problème ?', level: 2 })).exists();
        assert.dom(screen.getByText('En cas de problème technique')).exists();
      });
    });

    module('on the last page', function () {
      test('should display information', async function (assert) {
        // given
        // when
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);
        await _goToLastPage(screen);

        // then
        assert.dom(screen.getByRole('heading', { name: 'Règles à respecter', level: 2 })).exists();
        assert.dom(screen.getByText('En certification, il est interdit de :')).exists();
        assert
          .dom(
            screen.getByRole('checkbox', {
              name: 'En cochant cette case, je reconnais avoir pris connaissances de ces règles et je m’engage à les respecter.',
            }),
          )
          .exists();
      });

      test('should change the continue aria label button', async function (assert) {
        // given
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);

        // when
        await _goToLastPage(screen);

        // then
        assert.dom(screen.getByRole('button', { name: "Continuer vers la page d'entrée en certification" })).exists();
      });

      test('should disable the continue button', async function (assert) {
        // given
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);

        // when
        await _goToLastPage(screen);

        // then
        assert
          .dom(screen.getByRole('button', { name: "Continuer vers la page d'entrée en certification" }))
          .isDisabled();
      });

      module('when the checkbox is checked', function () {
        test('should enable the continue button', async function (assert) {
          // given
          const screen = await render(hbs`<CertificationInstructions::Steps/>`);
          await _goToLastPage(screen);

          // when
          await click(
            screen.getByRole('checkbox', {
              name: 'En cochant cette case, je reconnais avoir pris connaissances de ces règles et je m’engage à les respecter.',
            }),
          );

          // then
          assert
            .dom(screen.getByRole('button', { name: "Continuer vers la page d'entrée en certification" }))
            .isEnabled();
        });
      });
    });

    module('on all pages except the first', function () {
      test('should display the previous button', async function (assert) {
        // given
        const screen = await render(hbs`<CertificationInstructions::Steps/>`);

        // when
        await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));

        // then
        assert.dom(screen.getByRole('button', { name: "Revenir vers l'écran précédent" })).exists();
      });
    });
  });
});

async function _goToLastPage(screen) {
  const pageCount = 4;
  for (let i = 0; i < pageCount; i++) {
    await click(screen.getByRole('button', { name: "Continuer vers l'écran suivant" }));
  }
}
