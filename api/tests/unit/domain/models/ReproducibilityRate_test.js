const { expect, domainBuilder } = require('../../../test-helper');
const { ReproducibilityRate } = require('../../../../lib/domain/models/ReproducibilityRate');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
} = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | ReproducibilityRate', function() {

  context('#static fromAnswers', () => {

    it('is equal to 0% if no answers', () => {
      // when
      const reproducibilityRate = ReproducibilityRate.fromAnswers({ answers: [] });

      // then
      expect(reproducibilityRate.value).to.equal(0);
    });

    it('is equal to 50% if 1 answer is correct and 1 is non-correct', () => {
      // given
      const answers = [
        domainBuilder.buildAnswer({ result: AnswerStatus.OK }),
        domainBuilder.buildAnswer({ result: AnswerStatus.KO }),
      ];

      // when
      const reproducibilityRate = ReproducibilityRate.fromAnswers({ answers });

      // then
      expect(reproducibilityRate.value).to.equal(50);
    });

    it('is equal to 33% if 1 answer is correct and 2 are non-correct', () => {
      // given
      const answers = [
        domainBuilder.buildAnswer({ result: AnswerStatus.OK }),
        domainBuilder.buildAnswer({ result: AnswerStatus.TIMEDOUT }),
        domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED }),
      ];

      // when
      const reproducibilityRate = ReproducibilityRate.fromAnswers({ answers });

      // then
      expect(reproducibilityRate.value).to.equal(33);
    });
  });
  context('#static from', () => {

    it('is equal to 0% non non-neutralizedAnswers', () => {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 0,
        numberOfCorrectAnswers: 0,
      });

      // then
      expect(reproducibilityRate.value).to.equal(0);
    });

    it('is equal to 0% non correct answers', () => {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 1,
        numberOfCorrectAnswers: 0,
      });

      // then
      expect(reproducibilityRate.value).to.equal(0);
    });

    it('is equal to 50% if 1 answer is correct 2 non-neutralized challenges', () => {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 2,
        numberOfCorrectAnswers: 1,
      });

      // then
      expect(reproducibilityRate.value).to.equal(50);
    });

    it('is equal to 33% if 1 correct answer and 3 non-neutralized challenges', () => {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 3,
        numberOfCorrectAnswers: 1,
      });

      // then
      expect(reproducibilityRate.value).to.equal(33);
    });
  });

  context('#isEnoughToBeCertified', () => {

    it(`should be true if reproducibility rate value is above ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED}`, () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED + 1,
      });

      // when
      const isEnoughToBeCertified = reproducibilityRate.isEnoughToBeCertified();

      // then
      expect(isEnoughToBeCertified).to.be.true;
    });

    it(`should be true if reproducibility rate value is equal ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED}`, () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
      });

      // when
      const isEnoughToBeCertified = reproducibilityRate.isEnoughToBeCertified();

      // then
      expect(isEnoughToBeCertified).to.be.true;
    });

    it(`should be false if reproducibility rate value is under ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED}`, () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED - 1,
      });

      // when
      const isEnoughToBeCertified = reproducibilityRate.isEnoughToBeCertified();

      // then
      expect(isEnoughToBeCertified).to.be.false;
    });
  });

  context('#isEqualOrAbove', () => {

    it('should be true if reproducibility rate value is above given value', () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: 43,
      });

      // when
      const isEqualOrAbove = reproducibilityRate.isEqualOrAbove(42);

      // then
      expect(isEqualOrAbove).to.be.true;
    });

    it('should be true if reproducibility rate value is equal given value', () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: 42,
      });

      // when
      const isEqualOrAbove = reproducibilityRate.isEqualOrAbove(42);

      // then
      expect(isEqualOrAbove).to.be.true;
    });

    it('should be false if reproducibility rate value is under given value', () => {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: 41,
      });

      // when
      const isEqualOrAbove = reproducibilityRate.isEqualOrAbove(42);

      // then
      expect(isEqualOrAbove).to.be.false;
    });
  });
});
