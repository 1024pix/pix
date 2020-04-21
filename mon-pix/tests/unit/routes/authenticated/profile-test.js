import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | authenticated/profile', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:authenticated.profile');
    expect(route).to.be.ok;
  });
});
