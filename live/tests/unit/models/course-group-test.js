import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Course-group', function() {

  setupModelTest('course-group', {
    needs: ['model:course']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });
});
