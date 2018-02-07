import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | assessment rating', function() {
  setupModelTest('assessment-rating', {
    needs: []
  });

  // Replace this with your real tests.
  it('exists', function() {
    // given
    const model = this.subject();

    // then
    expect(model).to.be.ok;
  });
});
