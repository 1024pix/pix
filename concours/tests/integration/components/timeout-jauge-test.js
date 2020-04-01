import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | TimeoutJauge', function() {

  setupRenderingTest();

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
      expect(find('.svg-timeout-clock-black')).to.not.exist;
      expect(find('.svg-timeout-clock-red')).to.exist;
    });

    it('It renders a black clock if time is not over', async function() {
      // when
      await render(hbs`{{timeout-jauge allotedTime=1}}`);

      // then
      expect(find('.svg-timeout-clock-red')).to.not.exist;
      expect(find('.svg-timeout-clock-black')).to.exist;
    });

  });

});
