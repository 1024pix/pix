import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

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
      const model = {
        get: sinon.stub().withArgs('answersSinceLastCheckpoints').returns([])
      };
      const controller = this.subject();
      controller.set('model', model);

      // then
      expect(controller.get('totalPixForFiveNewAnswer')).to.equal(0);
    });

    it('should sum pixEarned by answers since last checkpoint', function() {
      // when
      const controller = this.subject();
      const model = {
        get: sinon.stub().withArgs('answersSinceLastCheckpoints').returns([
          { pixEarned: 2 },
          { pixEarned: 2.8 },
        ])
      };
      controller.set('model', model);

      // then
      expect(controller.get('totalPixForFiveNewAnswer')).to.equal(4);
    });
  });
});
