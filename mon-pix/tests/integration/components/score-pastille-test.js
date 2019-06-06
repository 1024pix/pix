import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | score pastille', function() {
  setupRenderingTest();

  describe('Component rendering', function() {

    it('should render component', async function() {
      // when
      await render(hbs`{{score-pastille}}`);

      // then
      expect(find('.score-pastille')).to.exist;
    });

    describe('Component dashes rendering instead of zero cases:', function() {

      it('should display two dashes, when no pixScore provided', async function() {
        // when
        await render(hbs`{{score-pastille}}`);
        // then
        expect(find('.score-pastille__pix-score').textContent.trim()).to.equal('–');
      });

    });

    it('should display provided score in pastille', async function() {
      // given
      const pixScore = '777';
      this.set('pixScore', pixScore);
      // when
      await render(hbs`{{score-pastille pixScore=pixScore}}`);
      // then
      expect(find('.score-pastille__pix-score').textContent.trim()).to.equal(pixScore);
    });
  });
});
