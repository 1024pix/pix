import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | progression-gauge', (hooks) => {
  setupRenderingTest(hooks);

  module('Component rendering', () => {

    test('should render component', async function(assert) {
      // when
      await render(hbs`<ProgressionGauge/>`);

      // then
      assert.dom('.progression-gauge').exists();
    });

    test('should display given total value in total', async function(assert) {
      // given
      const total = '70';
      this.set('total', total);

      // when
      await render(hbs`<ProgressionGauge @total={{total}}/>`);

      // then
      assert.dom('.progression-gauge').hasAttribute('style', `width: ${total}%`);
    });

    test('should display given value in progression', async function(assert) {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`<ProgressionGauge @value={{value}} @total=70/>`);

      // then
      assert.dom('.progression-gauge__marker').hasAttribute('style', `width: ${value}%`);
      assert.dom('.progression-gauge__tooltip-wrapper').hasAttribute('style', `width: ${value}%`);
    });
  });
});
