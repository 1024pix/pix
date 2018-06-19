import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | skill review', function() {
  setupModelTest('skill-review', {
    // Specify the other units that are required for this test.
    needs: []
  });

  describe('Computed property #profileMasteryInPourcent', function() {

    it('should compute a property in %', function() {
      run(() => {
        // given
        const store = this.store();
        const skillReview = store.createRecord('skill-review', { profileMastery: 0.6815 });

        // when
        const profileMasteryInPourcent = skillReview.get('profileMasteryInPourcent');

        // then
        expect(profileMasteryInPourcent).to.equal(68.2);
      });
    });

    it('should round the property%', function() {
      run(() => {
        // given
        const store = this.store();
        const skillReview = store.createRecord('skill-review', { profileMastery: 0.651 });

        // when
        const profileMasteryInPourcent = skillReview.get('profileMasteryInPourcent');

        // then
        expect(profileMasteryInPourcent).to.equal(65.1);
      });
    });

  });
});
