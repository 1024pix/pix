import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Student-information', function() {

  setupTest();

  it('exists', function() {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('student-information', {});
    expect(model).to.be.ok;
  });
});
