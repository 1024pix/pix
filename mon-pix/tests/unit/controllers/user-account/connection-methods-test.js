import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Controller | user-account/connection-methods', function() {
  setupTest();

  it('exists', function() {
    const controller = this.owner.lookup('controller:user-account/connection-methods');
    expect(controller).to.be.ok;
  });
});
