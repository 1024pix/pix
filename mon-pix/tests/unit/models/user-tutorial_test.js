import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | user-saved-tutorial model', function () {
  setupTest();

  let store;

  beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  it('exists', function () {
    const model = store.createRecord('user-saved-tutorial');
    expect(model).to.be.ok;
  });
});
