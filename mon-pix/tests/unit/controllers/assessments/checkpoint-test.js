import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Controller | Assessments | Checkpoint', function() {

  setupTest('controller:assessments/checkpoint', {
    needs: ['service:current-routed-modal', 'service:metrics']
  });

  describe('#finalCheckpoint', () => {
    it('should equal false by default', function() {
      // when
      const controller = this.subject();

      // then
      expect(controller.get('finalCheckpoint')).to.be.false;
    });
  });

});
