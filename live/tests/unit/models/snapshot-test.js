import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | snapshot', function() {
  setupModelTest('snapshot', {
    // Specify the other units that are required for this test.
    needs: ['model:organization']
  });

  // Replace this with your real tests.
  it('exists', function() {
    const model = this.subject();
    // var store = this.store();
    expect(model).to.be.ok;
  });
});
