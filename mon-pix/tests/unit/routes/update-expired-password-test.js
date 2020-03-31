import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | update-expired-password', function() {
  setupTest();

  let route;

  beforeEach(function() {
    route = this.owner.lookup('route:update-expired-password');
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });
});
