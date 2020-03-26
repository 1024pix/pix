import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | tutorial panel', function() {
  setupRenderingTest();

  context('when the result is not ok', function() {
    beforeEach(function() {
      this.set('resultItemStatus', 'ko');
    });

    context('when a hint is present', function() {
      beforeEach(function() {
        this.set('hint', 'Ceci est un indice.');
        this.set('tutorials', []);
      });

      it('should render the hint', async function() {
        // when
        await render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(find('.tutorial-panel')).to.exist;
        expect(find('.tutorial-panel__hint-container')).to.exist;
        expect(find('.tutorial-panel__hint-title')).to.exist;
        expect(find('.tutorial-panel__hint-picto-container')).to.exist;
        expect(find('.tutorial-panel__hint-picto')).to.exist;
        expect(find('.tutorial-panel__hint-content')).to.exist;

        const $contentElement = find('.tutorial-panel__hint-content');
        expect($contentElement.textContent.trim()).to.equal('Ceci est un indice.');
      });
    });
    context('when a tutorial is present', function() {
      beforeEach(function() {
        this.set('hint', 'Ceci est un indice');
        this.set('tutorials', [{ titre: 'Ceci est un tuto', duration: '20:00:00' }]);
      });
      it('should render the tutorial', async function() {
        // when
        await render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(find('.tutorial-item')).to.exist;
        expect(find('.tutorial__content')).to.exist;
        expect(find('.tutorial-content__title')).to.exist;
        expect(find('.tutorial-content__duration')).to.exist;
      });
    });
  });
});
