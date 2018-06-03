import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | certification', function() {
  setupModelTest('certification', {
    needs: ['model:user']
  });

  // Replace this with your real tests.
  it('exists', function() {
    const model = this.subject();
    // var store = this.store();
    expect(model).to.be.ok;
  });
});
