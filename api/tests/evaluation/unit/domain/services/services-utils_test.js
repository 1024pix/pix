import { isAnswerValid, useLevenshteinRatio } from '../../../../../src/evaluation/domain/services/services-utils.js';
import { expect } from '../../../../test-helper.js';

describe('Evaluation | Unit | Domain | Services | services-utils', function () {
  describe('#useLevenshteinRatio', function () {
    it('should return true if tolerance #3 exists in enabled tolerances list', function () {
      // given
      const enabledTolerances = ['t1', 't3'];
      // when
      const isExist = useLevenshteinRatio(enabledTolerances);

      // then
      expect(isExist).to.be.true;
    });

    it('should return false if tolerance #3 does not exist in enabled tolerances list', function () {
      // given
      const enabledTolerances = ['t1', 't2'];
      // when
      const isExist = useLevenshteinRatio(enabledTolerances);

      // then
      expect(isExist).to.be.false;
    });
  });

  describe('#isAnswerValid', function () {
    context('when the t3 treatment is disabled', function () {
      it('returns true when the answer strictly matches one of the solutions', function () {
        // given
        const solutions = ['Paris', 'Lyon'];

        // when
        const result = isAnswerValid('Paris', solutions);

        // then
        expect(result).to.be.true;
      });

      it('returns false when the answer does not strictly match any solution', function () {
        // given
        const solutions = ['Paris', 'Lyon'];

        // when
        const result = isAnswerValid('Marseille', solutions);

        // then
        expect(result).to.be.false;
      });

      it('returns false for an approximate match when t3 is not enabled', function () {
        // given
        const solutions = ['Paris', 'Lyon'];

        // when
        const result = isAnswerValid('Pariss', solutions, []);

        // then
        expect(result).to.be.false;
      });

      it('returns false when t3 is not among the enabled treatments', function () {
        // given
        const solutions = ['Paris'];

        // when
        const result = isAnswerValid('Pariss', solutions, ['t1', 't2']);

        // then
        expect(result).to.be.false;
      });
    });

    context('when the t3 treatment is enabled', function () {
      it('returns true when the answer is close enough to one of the solutions', function () {
        // given
        const solutions = ['Paris', 'Lyon'];

        // when
        const result = isAnswerValid('Pariss', solutions, ['t3']);

        // then
        expect(result).to.be.true;
      });

      it('returns true when the answer strictly matches one of the solutions', function () {
        // given
        const solutions = ['Paris', 'Lyon'];

        // when
        const result = isAnswerValid('Paris', solutions, ['t3']);

        // then
        expect(result).to.be.true;
      });

      it('returns false when the answer is too far from every solution', function () {
        // given
        const solutions = ['Paris', 'Lyon'];

        // when
        const result = isAnswerValid('Marseille', solutions, ['t3']);

        // then
        expect(result).to.be.false;
      });

      it('works when t3 is enabled alongside other treatments', function () {
        // given
        const solutions = ['Paris'];

        // when
        const result = isAnswerValid('Pariss', solutions, ['t1', 't3']);

        // then
        expect(result).to.be.true;
      });
    });

    context('edge cases', function () {
      it('returns false when no solution is provided', function () {
        // when
        const result = isAnswerValid('Paris');

        // then
        expect(result).to.be.false;
      });

      it('returns false when no solution is provided and t3 is enabled', function () {
        // when
        const result = isAnswerValid('Paris', [], ['t3']);

        // then
        expect(result).to.be.false;
      });
    });
  });
});
