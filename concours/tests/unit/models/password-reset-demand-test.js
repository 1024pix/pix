import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | password reset demand', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('password-reset-demand');
    expect(model).to.be.ok;
  });
});
