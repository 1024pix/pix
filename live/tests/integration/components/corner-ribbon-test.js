import { expect } from 'chai';
import { setupComponentTest, it } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | CornerRibbonComponent', function() {

  setupComponentTest('corner-ribbon', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{corner-ribbon}}`);
    expect(this.$()).to.have.lengthOf(1);
  });

});
