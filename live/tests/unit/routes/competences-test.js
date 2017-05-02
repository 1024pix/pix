import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | competences', function() {

  setupTest('route:competences', {
    needs: ['service:panelActions']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });
});
