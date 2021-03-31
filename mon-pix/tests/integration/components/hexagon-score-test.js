import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

describe('Integration | Component | hexagon-score', function() {
  setupIntlRenderingTest();

  describe('Component rendering', function() {
    class FeatureTogglesSub extends Service {
      featureToggles = {
        isAprilFoolEnabled: false,
      };
    }

    beforeEach(function() {
      this.owner.register('service:featureToggles', FeatureTogglesSub);
    });

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

  describe('Hexagon First April Edition ©', function() {
    class FeatureTogglesSub extends Service {
      featureToggles = {
        isAprilFoolEnabled: true,
      };
    }

    beforeEach(function() {
      this.clock = sinon.useFakeTimers();
      this.owner.register('service:featureToggles', FeatureTogglesSub);
    });

    afterEach(function() {
      this.clock.restore();
    }),

    it('should restore counter on click', async function() {
      // given
      const pixScore = '10';
      this.set('pixScore', pixScore);
      // when
      await render(hbs`<HexagonScore @pixScore={{this.pixScore}} />`);
      this.clock.tick(5000);
      await click('.hexagon-score');
      // then
      expect(this.element.querySelector('.hexagon-score-content__pix-score').innerHTML).to.equal(pixScore);
    });
  });
});
