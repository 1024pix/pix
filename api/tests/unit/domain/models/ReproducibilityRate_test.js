import { expect, domainBuilder } from '../../../test-helper';
import { ReproducibilityRate } from '../../../../lib/domain/models/ReproducibilityRate';
import { MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED } from '../../../../lib/domain/constants';

describe('Unit | Domain | Models | ReproducibilityRate', function () {
  context('#static from', function () {
    it('is equal to 0% non non-neutralizedAnswers', function () {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 0,
        numberOfCorrectAnswers: 0,
      });

      // then
      expect(reproducibilityRate.value).to.equal(0);
    });

    it('is equal to 0% non correct answers', function () {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 1,
        numberOfCorrectAnswers: 0,
      });

      // then
      expect(reproducibilityRate.value).to.equal(0);
    });

    it('is equal to 50% if 1 answer is correct 2 non-neutralized challenges', function () {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 2,
        numberOfCorrectAnswers: 1,
      });

      // then
      expect(reproducibilityRate.value).to.equal(50);
    });

    it('is equal to 33% if 1 correct answer and 3 non-neutralized challenges', function () {
      // when
      const reproducibilityRate = ReproducibilityRate.from({
        numberOfNonNeutralizedChallenges: 3,
        numberOfCorrectAnswers: 1,
      });

      // then
      expect(reproducibilityRate.value).to.equal(33);
    });
  });

  context('#isEnoughToBeCertified', function () {
    it(`should be true if reproducibility rate value is above ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED}`, function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED + 1,
      });

      // when
      const isEnoughToBeCertified = reproducibilityRate.isEnoughToBeCertified();

      // then
      expect(isEnoughToBeCertified).to.be.true;
    });

    it(`should be true if reproducibility rate value is equal ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED}`, function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED,
      });

      // when
      const isEnoughToBeCertified = reproducibilityRate.isEnoughToBeCertified();

      // then
      expect(isEnoughToBeCertified).to.be.true;
    });

    it(`should be false if reproducibility rate value is under ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_CERTIFIED}`, function () {
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

  context('#isEqualOrAbove', function () {
    it('should be true if reproducibility rate value is above given value', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: 43,
      });

      // when
      const isEqualOrAbove = reproducibilityRate.isEqualOrAbove(42);

      // then
      expect(isEqualOrAbove).to.be.true;
    });

    it('should be true if reproducibility rate value is equal given value', function () {
      // given
      const reproducibilityRate = domainBuilder.buildReproducibilityRate({
        value: 42,
      });

      // when
      const isEqualOrAbove = reproducibilityRate.isEqualOrAbove(42);

      // then
      expect(isEqualOrAbove).to.be.true;
    });

    it('should be false if reproducibility rate value is under given value', function () {
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
