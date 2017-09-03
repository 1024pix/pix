import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | legal notices', function() {
  setupTest('route:legal-notices', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
    needs: ['service:current-routed-modal']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });
});
