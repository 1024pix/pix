import EmberObject from '@ember/object';
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
    this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus}}`);

    // then
    expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__hint-container')).to.have.lengthOf(0);
    expect(this.$('.tutorial-panel__default-message-container')).to.have.lengthOf(0);
  });

  it('should render the hint when answer is not correct and hint is present', function() {
    // given
    this.set('hint', 'Ceçi est une astuce.');
    this.set('resultItemStatus', 'ko');

    // when
    this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus}}`);

    // then
    expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__hint-container')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__hint-title')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__hint-picto-container')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__hint-picto')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__hint-content')).to.have.lengthOf(1);

    const $contentElement = this.$('.tutorial-panel__hint-content');
    expect($contentElement.text().trim()).to.equal('Ceçi est une astuce.');
  });

  it('should render the default message when answer is not correct and hint is not defined', function() {
    // given
    this.set('hint', null);
    this.set('resultItemStatus', 'ko');

    // when
    this.render(hbs`{{tutorial-panel hint=hint resultItemStatus=resultItemStatus}}`);

    // then
    expect(this.$('.tutorial-panel')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__default-message-container')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__default-message-title')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__default-message-picto-container')).to.have.lengthOf(1);
    expect(this.$('.tutorial-panel__default-message-picto')).to.have.lengthOf(1);
  });
});
