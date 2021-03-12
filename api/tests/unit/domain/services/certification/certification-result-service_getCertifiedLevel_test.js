const _ = require('lodash');
const { expect } = require('../../../../test-helper');
const { _getCertifiedLevel } = require('../../../../../lib/domain/services/certification-result-service');

const {
  MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
  UNCERTIFIED_LEVEL,
} = require('../../../../../lib/domain/constants');

describe('Unit | Service | Certification Result Service :: getCertifiedLevel', function() {
  context('3 answers are correct', () => {
    it('certifies the estimated level', () => {
      // when
      const result = _getCertifiedLevel({
        numberOfCorrectAnswers: 3,
        estimatedLevel: 3,
        reproducibilityRate: 0, // unimportant
      });

      // then
      expect(result).to.equal(3);
    });
  });
  context('only 2 answers are correct', () => {
    it(`certifies the estimated level when reproducibility rate >= ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}`, () => {
      // when
      const result = _getCertifiedLevel({
        numberOfCorrectAnswers: 2,
        estimatedLevel: 3,
        reproducibilityRate: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED,
      });

      // then
      expect(result).to.equal(3);
    });
    it(`certifies a level below the estimated level when reproducibility rate < ${MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED}`, () => {
      // when
      const result = _getCertifiedLevel({
        numberOfCorrectAnswers: 2,
        estimatedLevel: 3,
        reproducibilityRate: MINIMUM_REPRODUCIBILITY_RATE_TO_BE_TRUSTED - 1,
      });

      // then
      expect(result).to.equal(2);
    });
  });
  context('less than 2 answers are correct', () => {
    it('does not certify a level', () => {
      // when
      const result = _getCertifiedLevel({
        numberOfCorrectAnswers: 1,
        estimatedLevel: 3,
        reproducibilityRate: 100, // unimportant
      });

      // then
      expect(result).to.equal(UNCERTIFIED_LEVEL);
    });
  });
});
