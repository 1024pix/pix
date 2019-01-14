import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Smart Placement Progression', function() {
  setupModelTest('smart-placement-progression', {
    // Specify the other units that are required for this test.
    needs: []
  });

  describe('Computed property #masteryPercentage', function() {

    it('should compute a property in %', function() {
      run(() => {
        // given
        const store = this.store();
        const smartPlacementProgression = store.createRecord('smart-placement-progression', { masteryRate: 0.6815 });

        // when
        const masteryInPourcent = smartPlacementProgression.get('masteryPercentage');

        // then
        expect(masteryInPourcent).to.equal('68%');
      });
    });
  });

  describe('Computed property #completionPercentage', function() {

    it('should compute a completionRate property in %', function() {
      run(() => {
        // given
        const store = this.store();
        const smartPlacementProgression = store.createRecord('smart-placement-progression', { completionRate: 0.06815 });

        // when
        const masteryInPourcent = smartPlacementProgression.get('completionPercentage');

        // then
        expect(masteryInPourcent).to.equal('7%');
      });
    });
  });

});
