import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | QCM proposals', function() {

  setupComponentTest('qcm-proposals', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{qcm-proposals}}`);
    expect(this.$()).to.have.length(1);
  });

});

