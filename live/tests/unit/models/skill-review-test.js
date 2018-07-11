import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | skill review', function() {
  setupModelTest('skill-review', {
    // Specify the other units that are required for this test.
    needs: []
  });

  describe('Computed property #profileMasteryPercentage', function() {

    it('should compute a property in %', function() {
      run(() => {
        // given
        const store = this.store();
        const skillReview = store.createRecord('skill-review', { profileMasteryRate: 0.6815 });

        // when
        const profileMasteryInPourcent = skillReview.get('profileMasteryPercentage');

        // then
        expect(profileMasteryInPourcent).to.equal('68.2%');
      });
    });

    it('should round the property to one decimal %', function() {
      run(() => {
        // given
        const store = this.store();
        const skillReview = store.createRecord('skill-review', { profileMasteryRate: 0.651 });

        // when
        const profileMasteryInPourcent = skillReview.get('profileMasteryPercentage');

        // then
        expect(profileMasteryInPourcent).to.equal('65.1%');
      });
    });

  });

  describe('Computed property #profileCompletionPercentage', function() {

    it('should compute a profileCompletionRate property in %', function() {
      run(() => {
        // given
        const store = this.store();
        const skillReview = store.createRecord('skill-review', { profileCompletionRate: 0.06815 });

        // when
        const profileMasteryInPourcent = skillReview.get('profileCompletionPercentage');

        // then
        expect(profileMasteryInPourcent).to.equal('7%');
      });
    });
  });

});
