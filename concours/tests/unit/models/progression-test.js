import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | Progression', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('progression');
    expect(model).to.be.ok;
  });

  describe('Computed property #completionPercentage', function() {

    it('should compute a completionRate property in %', function() {
      run(() => {
        // given
        const progression = store.createRecord('progression', { completionRate: 0.06815 });

        // when
        const completionPercentage = progression.get('completionPercentage');

        // then
        expect(completionPercentage).to.equal(7);
      });
    });
  });
});
