import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | challenges-preview', function() {

  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:challenge-preview');
    expect(route).to.be.ok;
  });

});
