import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TimeoutGauge', function (hooks) {
  setupIntlRenderingTest(hooks);

  const BLACK_GAUGE_ICON_PATH = '/images/icons/icon-timeout-black.svg';
  const RED_GAUGE_ICON_PATH = '/images/icons/icon-timeout-red.svg';

  module('Component rendering', function () {
    test('renders', async function (assert) {
      // when
      await render(hbs`<TimeoutGauge />`);

      // then
      assert.dom('.timeout-gauge').exists();
    });

    test('renders with given allotted time', async function (assert) {
      // given
      this.set('allottedTime', 60);

      // when
      await render(hbs`<TimeoutGauge @allottedTime={{this.allottedTime}} />`);

      // then
      assert.strictEqual(find('[data-test="timeout-gauge-remaining"]').textContent.trim(), '1:00');
    });

    test('renders a red clock if time is over', async function (assert) {
      // given
      this.set('allottedTime', 0);

      // when
      await render(hbs`<TimeoutGauge @allottedTime={{this.allottedTime}} />`);

      // then
      assert.dom(`.timeout-gauge-clock img[src="${RED_GAUGE_ICON_PATH}"]`).exists();
      assert.dom(`.timeout-gauge-clock img[src="${BLACK_GAUGE_ICON_PATH}"]`).doesNotExist();
    });

    test('renders a black clock if time is not over', async function (assert) {
      // given
      this.set('allottedTime', 1);

      // when
      await render(hbs`<TimeoutGauge @allottedTime={{this.allottedTime}} />`);

      // then
      assert.dom(`.timeout-gauge-clock img[src="${BLACK_GAUGE_ICON_PATH}"]`).exists();
      assert.dom(`.timeout-gauge-clock img[src="${RED_GAUGE_ICON_PATH}"]`).doesNotExist();
    });
  });
});
