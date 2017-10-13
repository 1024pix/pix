import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | password reset', function() {
  setupTest('route:password-reset-demand', {
    // Specify the other units that are required for this test.
    needs: ['service:current-routed-modal']
  });

  let route;

  beforeEach(function() {
    route = this.subject();
  });

  it('exists', function() {
    expect(route).to.be.ok;
  });

});
