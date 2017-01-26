import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | challenge stay', function() {

  setupComponentTest('challenge-stay', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{challenge-stay}}`);
    expect(this.$()).to.have.length(1);
  });

});
