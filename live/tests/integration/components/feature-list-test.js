import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | feature list', function () {

  setupComponentTest('feature-list', {
    integration: true
  });

  it('renders', function () {
    this.render(hbs`{{feature-list}}`);
    expect(this.$()).to.have.length(1);
  });

  it('should always render 5 feature-items', function () {
    // when
    this.render(hbs`{{feature-list}}`);

    // then
    expect(this.$('.feature-list__li')).to.have.lengthOf(5);
    expect(this.$('.feature-item')).to.have.lengthOf(5);
  });

});
