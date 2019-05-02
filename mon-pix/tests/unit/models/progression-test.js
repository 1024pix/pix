import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Progression', function() {
  setupModelTest('progression', {
    needs: []
  });

  describe('Computed property #completionPercentage', function() {

    it('should compute a completionRate property in %', function() {
      run(() => {
        // given
        const store = this.store();
        const progression = store.createRecord('progression', { completionRate: 0.06815 });

        // when
        const completionPercentage = progression.get('completionPercentage');

        // then
        expect(completionPercentage).to.equal(7);
      });
    });
  });
});
