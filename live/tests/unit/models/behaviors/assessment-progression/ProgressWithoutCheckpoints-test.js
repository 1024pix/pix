import { expect } from 'chai';
import { describe, it } from 'mocha';

import ProgressWithoutCheckpoints from 'pix-live/models/behaviors/assessment-progression/ProgressWithoutCheckpoints';

describe('Unit | Model | Behavior | assessment-progression | ProgressWithoutCheckpoints', function() {

  describe('#answersSinceLastCheckpoints(answers)', function() {
    it('should throw an error', function() {
      // given

      expect(() => {
        ProgressWithoutCheckpoints.answersSinceLastCheckpoints();
      }).to.throw;
    });
  });

  describe('Computed property #progress', function() {

    describe('#currentStep property', function() {
      it('should start at 1', function() {
        // given
        const nbAnswers = 0;

        // when
        const result = ProgressWithoutCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 1);
      });

      it('should be 2 if we answered once', function() {
        // given
        const nbAnswers = 1;

        // when
        const result = ProgressWithoutCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 2);
      });

      it('should be 3 if we answered twice', function() {
        // given
        const nbAnswers = 2;

        // when
        const result = ProgressWithoutCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 3);
      });

      it('should continue to 6 at the 5th answer', function() {
        // given
        const nbAnswers = 5;

        // when
        const result = ProgressWithoutCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 6);
      });
    });

    describe('#maxStep property', function() {
      it('should equal the number of challenges of the course', function() {
        // given
        const nbAnswers = 0;
        const nbChallenges = 12;

        // when
        const result = ProgressWithoutCheckpoints.progress(nbAnswers, nbChallenges);

        // then
        expect(result).to.have.property('maxStep', 12);
      });
    });

    describe('#stepPercentage property', function() {
      it('should be the completion percentage of the two other properties', function() {
        // given
        const nbAnswers = 0;
        const nbChallenges = 6;
        const expectedCompletionPercentage = (1 + nbAnswers) / nbChallenges * 100;

        // when
        const result = ProgressWithoutCheckpoints.progress(nbAnswers, nbChallenges);

        // then
        expect(result).to.have.property('stepPercentage', expectedCompletionPercentage);
      });
    });
  });
});
