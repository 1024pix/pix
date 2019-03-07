import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Controller | assessments/results/comparison', function() {

  setupTest('controller:assessments/results/comparison', {
    // Specify the other units that are required for this test.
    needs: ['service:pix-modal-dialog', 'service:metrics']
  });

  // Replace this with your real tests.
  it('exists', function() {
    const controller = this.subject();
    expect(controller).to.be.ok;
  });
});
