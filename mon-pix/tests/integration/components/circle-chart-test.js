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
      expect(this.element.querySelector('.circle-chart__container')).to.exist;
    });

    it('should display the progressing circle with given value', async function() {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`{{circle-chart value=value}}`);

      // then
      expect(this.element.querySelector('.circle-chart--slice').getAttribute('stroke-dasharray')).to.equal(`${value}, 100`);
    });
  });
});
