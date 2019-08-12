import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | profile panel', function() {
  setupRenderingTest();

  describe('(Rendering behavior) Component: ', function() {

    it('should be rendered', async function() {
      // when
      await render(hbs`{{profile-panel}}`);

      // then
      expect(find('.profile-panel')).to.exist;
    });

    it('should render a wrapper', async function() {
      // when
      await render(hbs`{{profile-panel}}`);

      // then
      const WRAPPER_CLASS = '.profile-panel';
      expect(find(WRAPPER_CLASS)).to.exist;
    });

    it('should render a profile header', async function() {
      // when
      await render(hbs`{{profile-panel}}`);

      // Then
      const HEADER_CLASS = '.profile-panel__header';
      const HEADER_TITLE = '.profile-header__title';
      expect(find(HEADER_CLASS)).to.exist;
      expect(find(HEADER_TITLE).textContent.trim()).to.equal('Votre profil');
    });

    it('should render a competence profile block', async function() {
      // when
      await render(hbs`{{profile-panel}}`);

      // Then
      const COMPETENCY_BLOCK = '.profile-panel__competence-areas';
      expect(find(COMPETENCY_BLOCK)).to.exist;
    });

    describe('behavior according to totalPixScore value', function() {
      it('should display two dashes instead of zero in total pix score, when user has’nt yet assessed on placement test', async function() {
        // given
        const totalPixScore = '';

        this.set('totalPixScore', totalPixScore);
        // when
        await render(hbs`{{profile-panel totalPixScore=totalPixScore}}`);

        // then
        expect(find('.profile-header__score-pastille-wrapper')).to.exist;
      });
    });
  });
});
