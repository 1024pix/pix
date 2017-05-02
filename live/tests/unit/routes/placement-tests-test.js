import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | placement-tests', function() {

  setupTest('route:placement-tests', {
    needs: ['service:delay']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

});

