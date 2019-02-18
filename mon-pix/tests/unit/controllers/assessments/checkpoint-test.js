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

  describe('#totalPixForFiveNewAnswer', function() {
    it('should return 0 when there is not answers since last checkpoints', function() {
      // when
      const controller = this.subject();
      controller.set('lastAnswers', []);

      // then
      expect(controller.get('totalPixForFiveNewAnswer')).to.equal(0);
    });

    it('should sum pixEarned by answers since last checkpoint', function() {
      // when
      const controller = this.subject();
      controller.set('lastAnswers', [
        { pixEarned: 2 },
        { pixEarned: 2.8 },
      ]);

      // then
      expect(controller.get('totalPixForFiveNewAnswer')).to.equal(4);
    });
  });
});
