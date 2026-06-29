import { render } from '@1024pix/ember-testing-library';
import CircleChart from 'mon-pix/components/circle-chart';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | circle-chart', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function () {
    test('should render component', async function (assert) {
      // when
      await render(<template><CircleChart /></template>);

      // then
      assert.ok(this.element.querySelector('.circle-chart'));
    });

    test('should display the progressing circle with given value', async function (assert) {
      // given
      const value = '60';

      // when
      await render(<template><CircleChart @value={{value}} /></template>);

      // then
      assert.strictEqual(
        this.element.querySelector('.circle--slice').getAttribute('stroke-dasharray'),
        `${value}, 100`,
      );
    });

    test('should display the circle with given color', async function (assert) {
      // given
      const value = '60';

      // when
      await render(<template><CircleChart @value={{value}} @sliceColor="green" /></template>);

      // then
      assert.ok(this.element.querySelector('.circle--slice').getAttribute('class').includes('circle--green'));
    });

    test('should display the circle with given stroke width', async function (assert) {
      // given
      const value = '60';

      // when
      await render(<template><CircleChart @value={{value}} @thicknessClass="circle--thick" /></template>);

      // then
      assert.ok(this.element.querySelector('.circle').getAttribute('class').includes('circle--thick'));
      assert.ok(this.element.querySelector('.circle--slice').getAttribute('class').includes('circle--thick'));
    });

    test('should display the chart with given width and height', async function (assert) {
      // when
      await render(<template><CircleChart @chartClass="circle-chart--big" /></template>);

      // then
      assert.ok(this.element.querySelector('.circle-chart').getAttribute('class').includes('circle-chart--big'));
    });
  });
});
