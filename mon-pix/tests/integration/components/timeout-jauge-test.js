import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | TimeoutJauge', function() {

  setupIntlRenderingTest();

  const BLACK_JAUGE_ICON_PATH = '/images/icon-timeout-black.svg';
  const RED_JAUGE_ICON_PATH = '/images/icon-timeout-red.svg';

  /* Rendering
  ----------------------------------------------------- */
  describe('Rendering', function() {
    it('It renders', async function() {
      // when
      await render(hbs`{{timeout-jauge }}`);

      // then
      expect(find('.timeout-jauge')).to.exist;
    });

    it('It renders a red clock if time is over', async function() {
      // when
      await render(hbs`{{timeout-jauge allotedTime=0}}`);

      // then
      expect(find(`.timeout-jauge-clock img[src="${RED_JAUGE_ICON_PATH}"]`)).to.exist;
      expect(find(`.timeout-jauge-clock img[src="${BLACK_JAUGE_ICON_PATH}"]`)).to.not.exist;
    });

    it('It renders a black clock if time is not over', async function() {
      // when
      await render(hbs`{{timeout-jauge allotedTime=1}}`);

      // then
      expect(find(`.timeout-jauge-clock img[src="${BLACK_JAUGE_ICON_PATH}"]`)).to.exist;
      expect(find(`.timeout-jauge-clock img[src="${RED_JAUGE_ICON_PATH}"]`)).to.not.exist;
    });

  });

});
