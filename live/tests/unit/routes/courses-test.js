import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | courses', function() {

  setupTest('route:courses', {});

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

});

