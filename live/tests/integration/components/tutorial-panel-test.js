import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | tutorial panel', function() {
  setupComponentTest('tutorial-panel', {
    integration: true
  });

  it('should not render default message nor hint when answer is correct', function() {
    // given
    this.set('hint', null);
    this.set('resultItemStatus', 'ok');

    // when
    this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

    // then
    expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__hint-container')).to.have.lengthOf(0);
    expect(this.$('.tutorial-panel__default-message-container')).to.have.lengthOf(0);
  });

  context('when the result is not ok', function() {
    beforeEach(function() {
      this.set('resultItemStatus', 'ko');
    });

    context('when there is nor a hint or a tutorial', function() {
      beforeEach(function() {
        this.set('hint', null);
        this.set('tutorials', []);
      });
      it('should render the default message', function() {
        // when
        this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__default-message-container')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__default-message-title')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__default-message-picto-container')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__default-message-picto')).to.have.lengthOf(1);
      });
      it('should not render a hint or a tutorial', function() {
        // when
        this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
        expect(this.$('.tutorial-panel__hint-container')).to.have.lengthOf(0);
        expect(this.$('.tutorial-panel__tutorial-item')).to.have.lengthOf(0);
      });
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
      it('should not render the default message', function() {
        // when
        this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(this.$('.tutorial-panel__default-message-container')).to.have.lengthOf(0);
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
      it('should not render the default message', function() {
        // when
        this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus tutorials=tutorials}}`);

        // then
        expect(this.$('.tutorial-panel__default-message-container')).to.have.lengthOf(0);
      });
    });
  });
});
