import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | circle-chart', function() {
  setupIntlRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // when
      await render(hbs`<CircleChart />`);

      // then
      expect(this.element.querySelector('.circle-chart')).to.exist;
    });

    it('should display the progressing circle with given value', async function() {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`<CircleChart @value={{this.value}}/>`);

      // then
      expect(this.element.querySelector('.circle--slice').getAttribute('stroke-dasharray')).to.equal(`${value}, 100`);
    });

    it('should display the circle with given color', async function() {
      // given
      this.set('value', '60');

      // when
      await render(hbs`<CircleChart @value={{this.value}} @sliceColor='green'/>`);

      // then
      expect(this.element.querySelector('.circle--slice').getAttribute('class')).to.contains('circle--green');
    });

    it('should display the circle with given stroke width', async function() {
      // given
      this.set('value', '60');

      // when
      await render(hbs`<CircleChart @value={{this.value}} @thicknessClass='circle--thick'/>`);

      // then
      expect(this.element.querySelector('.circle').getAttribute('class')).to.contains('circle--thick');
      expect(this.element.querySelector('.circle--slice').getAttribute('class')).to.contains('circle--thick');
    });

    it('should display the chart with given width and height', async function() {
      // when
      await render(hbs`<CircleChart @chartClass='circle-chart__content--big'/>`);

      // then
      expect(this.element.querySelector('.circle-chart__content').getAttribute('class')).to.contains('circle-chart__content--big');
    });
  });
});
