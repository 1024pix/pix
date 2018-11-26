import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | challenges-preview', function() {

  setupTest('route:challenge-preview', {
    needs: ['service:current-routed-modal', 'service:metrics']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

});
