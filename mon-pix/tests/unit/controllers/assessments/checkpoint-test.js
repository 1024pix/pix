import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Controller | Assessments | Checkpoint', function() {

  setupTest('controller:assessments/checkpoint', {
    needs: ['service:metrics']
  });

  describe('#finalCheckpoint', () => {
    it('should equal false by default', function() {
      // when
      const controller = this.subject();

      // then
      expect(controller.get('finalCheckpoint')).to.be.false;
    });
  });

  describe('#completionPercentage', () => {
    it('should equal 100 if it is the final checkpoint', function() {
      // when
      const controller = this.subject();
      controller.set('finalCheckpoint', true);

      // then
      expect(controller.get('completionPercentage')).to.equal(100);
    });

    it('should equal the progression completionPercentage', function() {
      // when
      const controller = this.subject();
      const model = {
        progression: {
          completionPercentage: 73,
        }
      };
      controller.set('model', model);

      // then
      expect(controller.get('completionPercentage')).to.equal(73);
    });
  });
});
