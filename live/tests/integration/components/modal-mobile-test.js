import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | modal mobile', function() {

  setupComponentTest('modal-mobile', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{modal-mobile}}`);
    expect(this.$()).to.have.lengthOf(1);
  });

  it('should display a title with a "warning" icon', function() {
    // when
    this.render(hbs`{{modal-mobile}}`);

    // then
    const $titleWarningIcon = this.$('.modal-title__warning-icon');
    expect($titleWarningIcon.attr('src')).to.equal('/images/icon-mobile-support-warning.svg');
  });

  it('should display a message', function() {
    // when
    this.render(hbs`{{modal-mobile}}`);

    // then
    const expected = 'Certaines épreuves PIX peuvent être difficiles à réussir sur mobile. Pour une meilleure expérience, nous vous conseillons de passer ce test sur un ordinateur.';
    expect(this.$('.modal-body').text().trim()).to.equal(expected);
  });
});
