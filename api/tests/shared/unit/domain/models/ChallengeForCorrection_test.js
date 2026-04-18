import { domainBuilder, expect } from '../../../../test-helper.js';
import { buildSolution } from '../../../../tooling/domain-builder/factory/index.js';

describe('Shared | Unit | Domain | Models | ChallengeForCorrection', function () {
  const TYPES = domainBuilder.evaluation.buildChallengeForCorrection.TYPES;

  describe('#get validator', function () {
    let solution;

    beforeEach(function () {
      solution = buildSolution({ id: 'challengeABC' });
    });

    it('returns validator for type QCU', function () {
      const challengeForCorrection = domainBuilder.evaluation.buildChallengeForCorrection({
        id: 'challengeABC',
        type: TYPES.QCU,
        solutionAlgo: solution,
      });

      expect(challengeForCorrection.validator).to.deepEqualInstance(
        domainBuilder.buildValidator.ofTypeQCU({ solution }),
      );
    });

    it('returns validator for type QCM', function () {
      const challengeForCorrection = domainBuilder.evaluation.buildChallengeForCorrection({
        id: 'challengeABC',
        type: TYPES.QCM,
        solutionAlgo: solution,
      });

      expect(challengeForCorrection.validator).to.deepEqualInstance(
        domainBuilder.buildValidator.ofTypeQCM({ solution }),
      );
    });

    it('returns validator for type QROC', function () {
      const challengeForCorrection = domainBuilder.evaluation.buildChallengeForCorrection({
        id: 'challengeABC',
        type: TYPES.QROC,
        solutionAlgo: solution,
      });

      expect(challengeForCorrection.validator).to.deepEqualInstance(
        domainBuilder.buildValidator.ofTypeQROC({ solution }),
      );
    });

    it('returns validator for type QROCM_IND', function () {
      const challengeForCorrection = domainBuilder.evaluation.buildChallengeForCorrection({
        id: 'challengeABC',
        type: TYPES.QROCM_IND,
        solutionAlgo: solution,
      });

      expect(challengeForCorrection.validator).to.deepEqualInstance(
        domainBuilder.buildValidator.ofTypeQROCMInd({ solution }),
      );
    });

    it('returns validator for type QROCM_DEP', function () {
      const challengeForCorrection = domainBuilder.evaluation.buildChallengeForCorrection({
        id: 'challengeABC',
        type: TYPES.QROCM_DEP,
        solutionAlgo: solution,
      });

      expect(challengeForCorrection.validator).to.deepEqualInstance(
        domainBuilder.buildValidator.ofTypeQROCMDep({ solution }),
      );
    });

    it('returns validator for unknown type', function () {
      const challengeForCorrection = domainBuilder.evaluation.buildChallengeForCorrection({
        id: 'challengeABC',
        type: 'coucou',
        solutionAlgo: solution,
      });

      expect(challengeForCorrection.validator).to.deepEqualInstance(domainBuilder.buildValidator({ solution }));
    });
  });
});
