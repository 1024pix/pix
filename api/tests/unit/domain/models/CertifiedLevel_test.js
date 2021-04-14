const { expect } = require('../../../test-helper');
const { CertifiedLevel } = require('../../../../lib/domain/models/CertifiedLevel');

const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
  UNCERTIFIED_LEVEL,
} = require('../../../../lib/domain/constants');

describe('Unit | Domain | Models | CertifiedLevel', function() {

  context('when 3 challenges were answered', () => {

    context('rule n°1: 3 OK', () => {

      it('certifies the estimated level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 3,
          numberOfNeutralizedAnswers: 0,
          estimatedLevel: 3,
          reproducibilityRate: 0, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°2 : 2 OK, 1 KO', () => {

      it(`certifies the estimated level when reproducibility rate >= ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}%`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfNeutralizedAnswers: 0,
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
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 2,
          estimatedLevel: 3,
          reproducibilityRate: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED - 1,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });
    });

    context('rules n°3 : 2 OK, 1 NEUTRALIZED', () => {

      it('certifies the estimated level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfNeutralizedAnswers: 1,
          numberOfCorrectAnswers: 2,
          estimatedLevel: 3,
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°4 : 1 OK, 2 KO', () => {

      it('does not certify a level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
      });
    });

    context('rule n°5: 1 OK, 1 KO, 1 NEUTRALIZED', () => {

      it(`certifies the estimated level is reproducibility rate >= ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 1,
          numberOfNeutralizedAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });

      it(`certifies a level below the estimated on if reproducibility rate >= 70% and < ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 1,
          numberOfNeutralizedAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 70,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });

      it('does not certify a level if reproducibility level < 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 1,
          numberOfNeutralizedAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 69,
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
      });
    });

    context('rule n°6: 1 OK, 2 NEUTRALIZED', () => {

      it('certifies the estimated level if reproducibility rate is >= 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 1,
          numberOfNeutralizedAnswers: 2,
          estimatedLevel: 3,
          reproducibilityRate: 70,
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });

      it('certifies a level below the estimated on if reproducibility rate < 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 1,
          numberOfNeutralizedAnswers: 2,
          estimatedLevel: 3,
          reproducibilityRate: 69,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });
    });

    context('rule n°7: 3 KO', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 0,
          numberOfNeutralizedAnswers: 0,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°8: 2 KO, 1 NEUTRALIZED', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 0,
          numberOfNeutralizedAnswers: 1,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°9: 1 KO, 2 NEUTRALIZED', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 0,
          numberOfNeutralizedAnswers: 2,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°10: 3 NEUTRALIZED', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 3,
          numberOfCorrectAnswers: 0,
          numberOfNeutralizedAnswers: 3,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });
  });

  context('when only 2 challenges were asked', () => {

    context('rule n°11: 2 OK', () => {

      it('certifies the estimated level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 0,
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

    context('rule n°12: 1 OK, 1 KO', () => {

      it(`certifies the estimated level when reproducibility rate >= ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}%`, () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 0,
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
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 70,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });

      it('does not certify a level when reproducibility rate < 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 69,
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°13: 1 OK, 1 NEUTRALIZED', () => {

      it('certifies the estimated level when reproducibility rate >= 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 1,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 70,
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });

      it('certifies a level below the estimated level when reproducibility rate < 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 1,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 69,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });
    });

    context('rule n°14: 2 KO', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 0,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°15: 1 KO, 1 NEUTRALIZED', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 1,
          numberOfCorrectAnswers: 0,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°16: 2 NEUTRALIZED', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 2,
          numberOfNeutralizedAnswers: 2,
          numberOfCorrectAnswers: 0,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 100, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

  });

  context('when only 1 challenge was asked', () => {

    context('rule n°17: 1 OK', () => {

      it('certifies the estimated level when reproducibility rate >= 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 1,
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 70,
        });

        // then
        expect(certifiedLevel.value).to.equal(3);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });

      it('certifies a level below the estimated level when reproducibility rate < 70%', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 1,
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 1,
          estimatedLevel: 3,
          reproducibilityRate: 69,
        });

        // then
        expect(certifiedLevel.value).to.equal(2);
        expect(certifiedLevel.isUncertified()).to.be.false;
        expect(certifiedLevel.isDowngraded()).to.be.true;
      });
    });

    context('rule n°18: 1 KO', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 1,
          numberOfNeutralizedAnswers: 0,
          numberOfCorrectAnswers: 0,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 69, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });

    context('rule n°19: 1 NEUTRALIZED', () => {

      it('does not certify any level', () => {
        // when
        const certifiedLevel = CertifiedLevel.from({
          numberOfChallengesAnswered: 1,
          numberOfNeutralizedAnswers: 1,
          numberOfCorrectAnswers: 0,
          estimatedLevel: 3, // unimportant
          reproducibilityRate: 69, // unimportant
        });

        // then
        expect(certifiedLevel.value).to.equal(UNCERTIFIED_LEVEL);
        expect(certifiedLevel.isUncertified()).to.be.true;
        expect(certifiedLevel.isDowngraded()).to.be.false;
      });
    });
  });

  context('when no rule is applicable', () => {
    it('throws', () => {
      // when
      expect(() => CertifiedLevel.from({
        numberOfChallengesAnswered: 1000,
        numberOfNeutralizedAnswers: 1000,
        numberOfCorrectAnswers: 1000,
        estimatedLevel: 0, // unimportant
        reproducibilityRate: 0, // unimportant
      })).to.throw();
    });
  });
});
