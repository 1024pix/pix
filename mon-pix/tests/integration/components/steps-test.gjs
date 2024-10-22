import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import Steps from 'mon-pix/components/certification-instructions/steps';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | steps', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when user accesses to v3 certification instructions page', function () {
    module('on first page', function () {
      test('should display instructions', async function (assert) {
        // given
        // when
        const screen = await render(<template><Steps /></template>);

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: `${t('pages.certification-instructions.steps.1.title')} Page 1 sur 5`,
              level: 2,
            }),
          )
          .exists();
        assert
          .dom(screen.getByRole('heading', { name: t('pages.certification-instructions.steps.1.question'), level: 3 }))
          .exists();
        assert
          .dom(
            screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
          )
          .exists();
      });

      test('should not display the previous button', async function (assert) {
        // given
        // when
        const screen = await render(<template><Steps /></template>);

        // then
        assert
          .dom(
            screen.queryByRole('button', { name: t('pages.certification-instructions.buttons.previous.aria-label') }),
          )
          .doesNotExist();
      });
    });

    module('on second page', function () {
      test('should display instructions', async function (assert) {
        // given
        // when
        const screen = await render(<template><Steps /></template>);
        await click(
          screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
        );

        // then
        assert
          .dom(
            screen.getByRole('heading', {
              name: `${t('pages.certification-instructions.steps.2.title')} Page 2 sur 5`,
              level: 2,
            }),
          )
          .exists();
        const images = screen.getAllByRole('presentation');
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
        const screen = await render(<template><Steps /></template>);
        await click(
          screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
        );
        await click(
          screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
        );

        // then
        assert.dom(screen.getByRole('heading', { name: 'Deux modes de questions Page 3 sur 5', level: 2 })).exists();
        assert.dom(screen.getByText(t('pages.certification-instructions.steps.3.paragraphs.1.title'))).exists();
        assert.dom(screen.getByText(t('pages.certification-instructions.steps.3.paragraphs.2.title'))).exists();

        const images = screen.getAllByRole('presentation');
        assert.strictEqual(
          images[0].getAttribute('src'),
          '/images/illustrations/certification-instructions-steps/regular-challenge-round.svg',
        );
        assert.strictEqual(
          images[1].getAttribute('src'),
          '/images/illustrations/certification-instructions-steps/focus-challenge-round.svg',
        );
      });
    });

    module('on fourth page', function () {
      test('should display instructions', async function (assert) {
        // given
        // when
        const screen = await render(<template><Steps /></template>);
        for (let i = 0; i < 3; i++) {
          await click(
            screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
          );
        }

        // then
        assert
          .dom(screen.getByRole('heading', { name: 'Que faire en cas de problème ? Page 4 sur 5', level: 2 }))
          .exists();
        assert.dom(screen.getByText('En cas de problème technique')).exists();
      });
    });

    module('on the last page', function () {
      test('should display information', async function (assert) {
        // given
        // when
        const screen = await render(<template><Steps /></template>);
        await _goToLastPage(screen);

        // then
        assert.dom(screen.getByRole('heading', { name: 'Règles à respecter Page 5 sur 5', level: 2 })).exists();
        assert.dom(screen.getByText(t('pages.certification-instructions.steps.5.text'))).exists();
        assert
          .dom(
            screen.getByRole('checkbox', {
              name: t('pages.certification-instructions.steps.5.checkbox-label'),
            }),
          )
          .exists();
      });

      test('should change the continue aria label button', async function (assert) {
        // given
        const screen = await render(<template><Steps /></template>);

        // when
        await _goToLastPage(screen);

        // then
        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.certification-instructions.buttons.continuous.last-page.aria-label'),
            }),
          )
          .exists();
      });

      test('should disable the continue button', async function (assert) {
        // given
        const screen = await render(<template><Steps /></template>);

        // when
        await _goToLastPage(screen);

        // then
        assert
          .dom(
            screen.getByRole('button', {
              name: t('pages.certification-instructions.buttons.continuous.last-page.aria-label'),
            }),
          )
          .isDisabled();
      });

      module('when the checkbox is checked', function () {
        test('should enable the continue button', async function (assert) {
          // given
          const screen = await render(<template><Steps /></template>);
          await _goToLastPage(screen);

          // when
          await click(
            screen.getByRole('checkbox', {
              name: t('pages.certification-instructions.steps.5.checkbox-label'),
            }),
          );

          // then
          assert
            .dom(
              screen.getByRole('button', {
                name: t('pages.certification-instructions.buttons.continuous.last-page.aria-label'),
              }),
            )
            .isEnabled();
        });
      });
    });

    module('on all pages except the first', function () {
      test('should display the previous button', async function (assert) {
        // given
        const screen = await render(<template><Steps /></template>);

        // when
        await click(
          screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
        );

        // then
        assert
          .dom(screen.getByRole('button', { name: t('pages.certification-instructions.buttons.previous.aria-label') }))
          .exists();
      });
    });
  });
});

async function _goToLastPage(screen) {
  const pageCount = 4;
  for (let i = 0; i < pageCount; i++) {
    await click(
      screen.getByRole('button', { name: t('pages.certification-instructions.buttons.continuous.aria-label') }),
    );
  }
}
