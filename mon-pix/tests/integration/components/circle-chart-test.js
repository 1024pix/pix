import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | circle-chart', function() {
  setupRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // when
      await render(hbs`{{circle-chart}}`);

      // then
      expect(this.element.querySelector('.circle-chart')).to.exist;
    });

    it('should display the progressing circle with given value', async function() {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`{{circle-chart value=value}}`);

      // then
      expect(this.element.querySelector('.circle--slice').getAttribute('stroke-dasharray')).to.equal(`${value}, 100`);
    });

    it('should display the circle with given color', async function() {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`{{circle-chart value=value sliceColor='green'}}`);

      // then
      expect(this.element.querySelector('.circle--slice').getAttribute('class')).to.contain('circle--green');
    });

    it('should display the circle with given stroke width', async function() {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`{{circle-chart value=value strokeWidth='2'}}`);

      // then
      expect(this.element.querySelector('.circle').getAttribute('style')).to.equal('stroke-width: 2');
      expect(this.element.querySelector('.circle--slice').getAttribute('style')).to.equal('stroke-width: 2');
    });

    it('should display the chart with given width and height', async function() {
      // when
      await render(hbs`{{circle-chart chartWidth='150'}}`);

      // then
      expect(this.element.querySelector('.circle-chart__content').getAttribute('style')).to.equal('width: 150px; height: 150px');
    });
  });
});
