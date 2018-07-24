import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | tutorial panel', function() {
  setupComponentTest('tutorial-panel', {
    integration: true
  });

  context('when the result is not ok', function() {
    beforeEach(function() {
      this.set('resultItemStatus', 'ko');
    });

    context('when a hint is present', function() {
      beforeEach(function() {
        this.set('hint', 'Ceci est un indice.');
        this.set('tutorials', []);
      });

      it('should render the hint', function() {
        // when
        this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__hint-container')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__hint-title')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__hint-picto-container')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__hint-picto')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__hint-content')).to.have.lengthOf(1);

        const $contentElement = this.$('.tutorial-panel__hint-content');
        expect($contentElement.text().trim()).to.equal('Ceci est un indice.');
      });
    });
    context('when a tutorial is present', function() {
      beforeEach(function() {
        this.set('hint', 'Ceci est un indice');
        this.set('tutorials', [{ titre: 'Ceci est un tuto', duration: '20:00:00' }]);
      });
      it('should render the tutorial', function() {
        // when
        this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__tutorials-container')).to.have.lengthOf(1);
        expect(this.$('.tutorial-item__tutorial-title')).to.have.lengthOf(1);
        expect(this.$('.tutorial-item__tutorial-details')).to.have.lengthOf(1);
      });
    });
  });
});
