import { expect } from '../../../../test-helper.js';
import {
  getEnabledTreatments,
  useLevenshteinRatio,
} from '../../../../../src/devcomp/domain/services/services-utils.js';

describe('Unit | Devcomp | Domain | Services | services-utils', function () {
  describe('#getEnabledTreatments', function () {
    describe('When we should apply the treatments', function () {
      it('should return treatments which are not deactivated', function () {
        // given
        const shouldApplyTreatments = true;
        const deactivations = {
          t1: true,
          t2: false,
          t3: false,
        };
        // when
        const enabledTreatments = getEnabledTreatments(shouldApplyTreatments, deactivations);

        // then
        expect(enabledTreatments).to.deep.equal(['t2', 't3']);
      });
    });

    describe('When we should not apply the treatments', function () {
      it('should return an empty list', function () {
        // given
        const shouldApplyTreatments = false;
        const deactivations = Symbol('deactivations');
        // when
        const enabledTreatments = getEnabledTreatments(shouldApplyTreatments, deactivations);

        // then
        expect(enabledTreatments).to.deep.equal([]);
      });
    });
  });

  describe('#useLevenshteinRatio', function () {
    it('should return true if treatment #3 exists in enabled treatments list', function () {
      // given
      const enabledTreatments = ['t1', 't3'];
      // when
      const isExist = useLevenshteinRatio(enabledTreatments);

      // then
      expect(isExist).to.be.true;
    });

    it('should return false if treatment #3 does not exist in enabled treatments list', function () {
      // given
      const enabledTreatments = ['t1', 't2'];
      // when
      const isExist = useLevenshteinRatio(enabledTreatments);

      // then
      expect(isExist).to.be.false;
    });
  });
});
