import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | GetResultComponent', function() {

  setupComponentTest('get-result', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{get-result}}`);
    expect(this.$()).to.have.length(1);
  });

});
