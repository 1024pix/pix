import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | TimeoutJauge', function() {

  setupIntlRenderingTest();

  const BLACK_JAUGE_ICON_PATH = '/images/icon-timeout-black.svg';
  const RED_JAUGE_ICON_PATH = '/images/icon-timeout-red.svg';

  describe('Component rendering', function() {
    it('renders', async function() {
      // when
      await render(hbs`<TimeoutJauge />`);

      // then
      expect(find('.timeout-jauge')).to.exist;
    });

    it('renders with given allotted time', async function() {
      // given
      this.set('allottedTime', 60);

      // when
      await render(hbs`<TimeoutJauge @allottedTime={{this.allottedTime}} />`);

      // then
      expect(find('.timeout-jauge-remaining').textContent.trim()).to.equal('1:00');
    });

    it('renders a red clock if time is over', async function() {
      // given
      this.set('allottedTime', 0);

      // when
      await render(hbs`<TimeoutJauge @allottedTime={{this.allottedTime}} />`);

      // then
      expect(find(`.timeout-jauge-clock img[src="${RED_JAUGE_ICON_PATH}"]`)).to.exist;
      expect(find(`.timeout-jauge-clock img[src="${BLACK_JAUGE_ICON_PATH}"]`)).to.not.exist;
    });

    it('renders a black clock if time is not over', async function() {
      // given
      this.set('allottedTime', 1);

      // when
      await render(hbs`<TimeoutJauge @allottedTime={{this.allottedTime}} />`);

      // then
      expect(find(`.timeout-jauge-clock img[src="${BLACK_JAUGE_ICON_PATH}"]`)).to.exist;
      expect(find(`.timeout-jauge-clock img[src="${RED_JAUGE_ICON_PATH}"]`)).to.not.exist;
    });

  });

});
