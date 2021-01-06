import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | hexagon-score', function() {
  setupIntlRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // when
      await render(hbs`<HexagonScore />`);
      // then

      expect(this.element.querySelector('.hexagon-score')).to.exist;
    });

    it('should display two dashes, when no pixScore provided', async function() {
      // when
      await render(hbs`<HexagonScore />`);

      // then
      expect(this.element.querySelector('.hexagon-score-content__pix-score').innerHTML).to.equal('–');
    });

    it('should display provided score in pastille', async function() {
      // given
      const pixScore = '777';
      this.set('pixScore', pixScore);
      // when
      await render(hbs`<HexagonScore @pixScore={{this.pixScore}} />`);
      // then
      expect(this.element.querySelector('.hexagon-score-content__pix-score').innerHTML).to.equal(pixScore);
    });
  });
});
