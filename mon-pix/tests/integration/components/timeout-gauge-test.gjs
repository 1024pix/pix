import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import TimeoutGauge from 'mon-pix/components/timeout-gauge';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | TimeoutGauge', function (hooks) {
  setupIntlRenderingTest(hooks);

  const BLACK_GAUGE_ICON_PATH = '/images/icons/icon-timeout-black.svg';
  const RED_GAUGE_ICON_PATH = '/images/icons/icon-timeout-red.svg';

  module('Component rendering', function () {
    test('renders', async function (assert) {
      // when
      await render(<template><TimeoutGauge /></template>);

      // then
      assert.dom('.timeout-gauge').exists();
    });

    [
      { allottedTime: 0, expected: '0:00' },
      { allottedTime: 60, expected: '1:00' },
      { allottedTime: 90, expected: '1:30' },
      { allottedTime: 120, expected: '2:00' },
    ].forEach(({ allottedTime, expected }) => {
      test(`renders "${expected}" as remaining time when allotted time is ${allottedTime}s`, async function (assert) {
        // given
        const allottedTimeValue = allottedTime;

        // when
        await render(<template><TimeoutGauge @allottedTime={{allottedTimeValue}} /></template>);

        // then
        assert.strictEqual(find('[data-test="timeout-gauge-remaining"]').textContent.trim(), expected);
      });
    });

    test('renders a gauge progress at 0% width when no time has elapsed', async function (assert) {
      // given
      const allottedTime = 70;

      // when
      await render(<template><TimeoutGauge @allottedTime={{allottedTime}} /></template>);

      // then
      assert.strictEqual(find('.timeout-gauge-progress').getAttribute('style'), 'width: 0%');
    });

    test('renders a gauge progress at 0% width when allotted time is not numeric', async function (assert) {
      // given
      const allottedTime = '  ';

      // when
      await render(<template><TimeoutGauge @allottedTime={{allottedTime}} /></template>);

      // then
      assert.strictEqual(find('.timeout-gauge-progress').getAttribute('style'), 'width: 0%');
    });

    test('renders a red clock if time is over', async function (assert) {
      // given
      const allottedTime = 0;

      // when
      await render(<template><TimeoutGauge @allottedTime={{allottedTime}} /></template>);

      // then
      assert.dom(`.timeout-gauge-clock img[src="${RED_GAUGE_ICON_PATH}"]`).exists();
      assert.dom(`.timeout-gauge-clock img[src="${BLACK_GAUGE_ICON_PATH}"]`).doesNotExist();
    });

    test('renders a black clock if time is not over', async function (assert) {
      // given
      const allottedTime = 1;

      // when
      await render(<template><TimeoutGauge @allottedTime={{allottedTime}} /></template>);

      // then
      assert.dom(`.timeout-gauge-clock img[src="${BLACK_GAUGE_ICON_PATH}"]`).exists();
      assert.dom(`.timeout-gauge-clock img[src="${RED_GAUGE_ICON_PATH}"]`).doesNotExist();
    });
  });
});
