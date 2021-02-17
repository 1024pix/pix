import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | progression-gauge', function() {
  setupIntlRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // when
      await render(hbs`<ProgressionGauge/>`);

      // then
      expect(this.element.querySelector('.progression-gauge')).to.exist;
    });

    it('should display given total value in total', async function() {
      // given
      const total = '70';
      this.set('total', total);

      // when
      await render(hbs`<ProgressionGauge @total={{this.total}}/>`);

      // then
      expect(this.element.querySelector('.progression-gauge').getAttribute('style')).to.equal(`width: ${total}%`);
    });

    it('should display given value in progression', async function() {
      // given
      const value = '60';
      const total = '70';
      this.set('value', value);
      this.set('total', total);

      // when
      await render(hbs`<ProgressionGauge @value={{this.value}} @total={{this.total}}/>`);

      // then
      expect(this.element.querySelector('.progression-gauge__marker').getAttribute('style')).to.equal(`width: ${value}%`);
      expect(this.element.querySelector('.progression-gauge__tooltip-wrapper').getAttribute('style')).to.equal(`width: ${value}%`);
    });
  });
});
