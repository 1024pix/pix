import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, find, render, triggerEvent, triggerKeyEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | hexagon-score', function() {
  setupIntlRenderingTest();

  const buttonClass = '.hexagon-score-content-pix-total__button';

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

    it('should display provided score in hexagon', async function() {
      // given
      const pixScore = '777';
      this.set('pixScore', pixScore);
      // when
      await render(hbs`<HexagonScore @pixScore={{this.pixScore}} />`);
      // then
      expect(this.element.querySelector('.hexagon-score-content__pix-score').innerHTML).to.equal(pixScore);
    });
  });

  describe('Tooltip behaviour', () => {
    const tooltip = '.hexagon-score__information';

    beforeEach(async () => {
      await render(hbs`<HexagonScore />`);
      expect(find(tooltip)).not.to.exist;
    });

    describe('on click', () => {
      it('should display tooltip on click when tooltip is hidden', async function() {
        // when
        await click(buttonClass);

        // then
        expect(find(tooltip)).to.exist;
      });

      it('should hide tooltip on click when tooltip is displayed', async function() {
        // when
        await click(buttonClass);
        await click(buttonClass);

        // then
        expect(find(tooltip)).not.to.exist;
      });
    });

    describe('on hover', () => {

      it('should display tooltip when mouse enters the score hexagon', async function() {
        // when
        await triggerEvent('.hexagon-score', 'mouseenter');

        // then
        expect(find(tooltip)).to.exist;
      });

      it('should hide tooltip when mouse leaves the score hexagon', async function() {
        // when
        await triggerEvent('.hexagon-score', 'mouseenter');
        await triggerEvent('.hexagon-score', 'mouseleave');

        // then
        expect(find(tooltip)).to.not.exist;
      });
    });

    describe('on ‘Escape‘ key pressed', () => {
      it('should hide tooltip', async () => {
        // given
        await triggerEvent('.hexagon-score', 'mouseenter');
        expect(find(tooltip)).to.exist;

        // when
        const escapeKeyCode = 27;
        await triggerKeyEvent('.hexagon-score__information', 'keyup', escapeKeyCode);

        // then
        expect(find(tooltip)).not.to.exist;
      });
    });

    describe('on button focusout', () => {
      it('should hide tooltip', async () => {
        // given
        const button = find(buttonClass);
        await click(button);
        expect(find(tooltip)).to.exist;

        // when
        await triggerEvent(button, 'focusout');

        // then
        expect(find(tooltip)).not.to.exist;
      });
    });
  });
});
