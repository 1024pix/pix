import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user-account/personal-information', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:user-account/personal-information');
    expect(route).to.be.ok;
  });
});
