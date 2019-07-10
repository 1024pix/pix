import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | password reset demand', function() {
  setupTest();

  let route;

  beforeEach(function() {
    route = this.owner.lookup('route:password-reset-demand');
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });

});
