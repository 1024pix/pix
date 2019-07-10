import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | assessment-checkpoint', function() {

  setupTest();

  let component;

  beforeEach(function() {
    component = this.owner.lookup('component:assessment-checkpoint');
  });

  describe('#finalCheckpoint', () => {
    it('should equal false by default', function() {
      // then
      expect(component.finalCheckpoint).to.be.false;
    });
  });

  describe('#completionPercentage', () => {
    it('should equal 100 if it is the final checkpoint', function() {
      // when
      component.set('finalCheckpoint', true);

      // then
      expect(component.completionPercentage).to.equal(100);
    });

    it('should equal the progression completionPercentage', function() {
      // when
      const assessment = {
        progression: {
          completionPercentage: 73,
        },
      };
      component.set('assessment', assessment);

      // then
      expect(component.completionPercentage).to.equal(73);
    });
  });

  describe('#shouldDisplayAnswers', () => {
    it('should be true when answers are present', function() {
      // when
      const assessment = {
        answersSinceLastCheckpoints: [0, 1, 2],
      };
      component.set('assessment', assessment);

      // then
      expect(component.shouldDisplayAnswers).to.be.true;
    });

    it('should be false when answers are absent', function() {
      // when
      const assessment = {
        answersSinceLastCheckpoints: [],
      };
      component.set('assessment', assessment);

      // then
      expect(component.shouldDisplayAnswers).to.be.false;
    });
  });
});
