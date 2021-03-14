const { expect } = require('../../../test-helper');
const { CertifiedLevel } = require('../../../../lib/domain/models/CertifiedLevel');

const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
  UNCERTIFIED_LEVEL,
} = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | CertifiedLevel', function() {
  context('when 3 challenges were answered', () => {
    context('3 answers are correct', () => {
      it('certifies the estimated level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 3,
          estimatedLevel: 3,
          reproducibilityRate: 0, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });
    context('only 2 answers are correct', () => {
      it(`certifies the estimated level when reproducibility rate >= ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}%`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 2,
          estimatedLevel: 3,
          reproducibilityRate: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
      });
      it(`certifies a level below the estimated level when reproducibility rate < ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}%`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 2,
          estimatedLevel: 3,
          reproducibilityRate: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED - 1,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });
    });
    context('less than 2 answers are correct', () => {
      it('does not certify a level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
      });
    });
  });
  context('when only 2 challenges were asked', () => {
    context('2 answers are correct', () => {
      it('certifies the estimated level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfCorrectAnswers: 2,
          estimatedLevel: 3,
          reproducibilityRate: 0, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });
    context('only 1 answer is correct', () => {
      it(`certifies the estimated level when reproducibility rate >= ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}%`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
      it(`certifies a level below the estimated level when reproducibility rate >= 70% and < ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}%`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 75,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });

    });
  });
});
