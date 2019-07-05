import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | profile-v2', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:profile-v2');
    expect(route).to.be.ok;
  });
});
