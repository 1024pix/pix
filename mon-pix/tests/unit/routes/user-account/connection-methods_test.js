import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user-account/connection-methods', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:user-account/connection-methods');
    expect(route).to.be.ok;
  });
});
