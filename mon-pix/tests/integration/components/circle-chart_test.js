import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | circle-chart', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render component', async function (assert) {
      // when
      await render(hbs`<CircleChart />`);

      // then
      assert.ok(this.element.querySelector('.circle-chart'));
    });

    test('should display the progressing circle with given value', async function (assert) {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`<CircleChart @value={{this.value}}/>`);

      // then
      assert.strictEqual(
        this.element.querySelector('.circle--slice').getAttribute('stroke-dasharray'),
        `${value}, 100`
      );
    });

    test('should display the circle with given color', async function (assert) {
      // given
      this.set('value', '60');

      // when
      await render(hbs`<CircleChart @value={{this.value}} @sliceColor='green'/>`);

      // then
      assert.ok(this.element.querySelector('.circle--slice').getAttribute('class').includes('circle--green'));
    });

    test('should display the circle with given stroke width', async function (assert) {
      // given
      this.set('value', '60');

      // when
      await render(hbs`<CircleChart @value={{this.value}} @thicknessClass='circle--thick'/>`);

      // then
      assert.ok(this.element.querySelector('.circle').getAttribute('class').includes('circle--thick'));
      assert.ok(this.element.querySelector('.circle--slice').getAttribute('class').includes('circle--thick'));
    });

    test('should display the chart with given width and height', async function (assert) {
      // when
      await render(hbs`<CircleChart @chartClass='circle-chart__content--big'/>`);

      // then
      assert.ok(
        this.element
          .querySelector('.circle-chart__content')
          .getAttribute('class')
          .includes('circle-chart__content--big')
      );
    });
  });
});
