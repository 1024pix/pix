import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | circle-chart', (hooks) => {
  setupRenderingTest(hooks);

  module('Component rendering', () => {

    test('should render component', async function(assert) {
      // when
      await render(hbs`<CircleChart/>`);

      // then
      assert.dom('.circle-chart').exists();
    });

    test('should display the progressing circle with given value', async function(assert) {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`<CircleChart @value={{value}}/>`);

      // then
      assert.dom('.circle--slice').hasAttribute('stroke-dasharray', `${value}, 100`);
    });

    test('should not display the progressing circle when circle is disabled', async function(assert) {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`<CircleChart @value={{value}} @isDisabled=true/>`);

      // then
      assert.dom('.circle--slice').doesNotExist();
      assert.dom('.circle-chart__text').doesNotExist();
    });
  });
});
