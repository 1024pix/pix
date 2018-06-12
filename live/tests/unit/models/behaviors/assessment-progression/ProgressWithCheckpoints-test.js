import { expect } from 'chai';
import { describe, it } from 'mocha';
import _ from 'lodash';

import ProgressWithCheckpoints from 'pix-live/models/behaviors/assessment-progression/ProgressWithCheckpoints';

describe('Unit | Model | Behavior | assessment-progression | ProgressWithCheckpoints', function() {
  describe('#answersSinceLastCheckpoints(answers)', function() {

    it('should return an empty array when no answers has been given', function() {
      // given
      const answers = [];

      // when
      const answersSinceLastCheckpoints = ProgressWithCheckpoints.answersSinceLastCheckpoints(answers);

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([]);
    });

    it('should return the one answer when only one answer has been given', function() {
      // given
      const answers = ['irrelevant content'];

      // when
      const answersSinceLastCheckpoints = ProgressWithCheckpoints.answersSinceLastCheckpoints(answers);

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal(answers);
    });

    it('should return the last 2 answers when there is 7 answers', function() {
      // given
      const answers = _.times(7, () => 'irrelevant content');
      const [answer6, answer7] = answers.slice(5);

      // when
      const answersSinceLastCheckpoints = ProgressWithCheckpoints.answersSinceLastCheckpoints(answers);

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7]);
    });

    it('should return the last 5 answers when there is 10 answers', function() {
      // given
      const answers = _.times(10, () => 'irrelevant content');
      const [answer6, answer7, answer8, answer9, answer10] = answers.slice(5);

      // when
      const answersSinceLastCheckpoints = ProgressWithCheckpoints.answersSinceLastCheckpoints(answers);

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer6, answer7, answer8, answer9, answer10]);
    });

    it('should return the last 1 answer when there is 11 answers', function() {
      // given
      const answers = _.times(11, () => 'irrelevant content');
      const answer11 = answers[10];

      // when
      const answersSinceLastCheckpoints = ProgressWithCheckpoints.answersSinceLastCheckpoints(answers);

      // then
      expect(answersSinceLastCheckpoints).to.deep.equal([answer11]);
    });
  });

  describe('Computed property #progress', function() {

    describe('#currentStep property', function() {
      it('should start at 1', function() {
        // given
        const nbAnswers = 0;

        // when
        const result = ProgressWithCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 1);
      });

      it('should be 2 if we answered once', function() {
        // given
        const nbAnswers = 1;

        // when
        const result = ProgressWithCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 2);
      });

      it('should be 3 if we answered twice', function() {
        // given
        const nbAnswers = 2;

        // when
        const result = ProgressWithCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 3);
      });

      it('should reset to 1 at the 5th answer', function() {
        // given
        const nbAnswers = 5;

        // when
        const result = ProgressWithCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('currentStep', 1);
      });
    });

    describe('#maxStep property', function() {
      it('should always equal 5', function() {
        // given

        // when
        const result = ProgressWithCheckpoints.progress(0);

        // then
        expect(result).to.have.property('maxStep', 5);
      });
    });

    describe('#stepPercentage property', function() {
      it('should be the completion percentage of the two other properties', function() {
        // given
        const nbAnswers = 0;
        const nbChallenges = 5;
        const expectedCompletionPercentage = (1 + nbAnswers) / nbChallenges * 100;

        // when
        const result = ProgressWithCheckpoints.progress(nbAnswers);

        // then
        expect(result).to.have.property('stepPercentage', expectedCompletionPercentage);
      });
    });
  });
});
