import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | medal item', function() {
  setupComponentTest('medal-item', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{medal-item}}`);
    expect(this.$()).to.have.length(1);
  });

  it('should contain the number of pix passed in the component', function() {
    // given
    const pixScore = 20;
    this.set('pixScore', pixScore);

    // when
    this.render(hbs`{{medal-item pixScore=pixScore}}`);

    // then
    expect(this.$('.medal-item__pix-score').text()).to.contain(pixScore.toString());
  });

  it('should contain an image of a medal with the text pix', function() {
    // when
    this.render(hbs`{{medal-item pixScore=pixScore}}`);

    // then
    expect(this.$('.medal-item__medal-img').length).to.equal(1);
    expect(this.$('.medal-item__pix-text').text()).to.contain('pix');
  });
});
