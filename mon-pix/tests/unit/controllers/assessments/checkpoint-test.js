import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Controller | Assessments | Checkpoint', function() {

  setupTest();

  let controller;

  beforeEach(function() {
    controller = this.owner.lookup('controller:assessments/checkpoint');
  });

  describe('#finalCheckpoint', () => {
    it('should equal false by default', function() {
      // then
      expect(controller.finalCheckpoint).to.be.false;
    });
  });

  describe('#completionPercentage', () => {
    it('should equal 100 if it is the final checkpoint', function() {
      // when
      controller.set('finalCheckpoint', true);

      // then
      expect(controller.completionPercentage).to.equal(100);
    });

    it('should equal the progression completionPercentage', function() {
      // when
      const model = EmberObject.create({
        progression: {
          completionPercentage: 73,
        },
      });
      controller.set('model', model);

      // then
      expect(controller.completionPercentage).to.equal(73);
    });
  });

  describe('#shouldDisplayAnswers', () => {
    it('should be true when answers are present', function() {
      // when
      const model = {
        answersSinceLastCheckpoints: [0, 1, 2],
      };
      controller.set('model', model);
      // then
      expect(controller.shouldDisplayAnswers).to.be.true;
    });

    it('should be false when answers are absent', function() {
      // when
      const model = {
        answersSinceLastCheckpoints: [],
      };
      controller.set('model', model);
      // then
      expect(controller.shouldDisplayAnswers).to.be.false;
    });
  });
});
