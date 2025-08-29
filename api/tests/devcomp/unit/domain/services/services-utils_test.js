import {
  getEnabledTolerances,
  useLevenshteinRatio,
} from '../../../../../src/devcomp/domain/services/services-utils.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Devcomp | Domain | Services | services-utils', function () {
  describe('#getEnabledTolerances', function () {
    describe('When we should apply the tolerances', function () {
      it('should return tolerances which are not deactivated', function () {
        // given
        const shouldApplyTolerances = true;
        const deactivations = {
          t1: true,
          t2: false,
          t3: false,
        };
        // when
        const enabledTolerances = getEnabledTolerances(shouldApplyTolerances, deactivations);

        // then
        expect(enabledTolerances).to.deep.equal([
          't2',
          't3',
          't4',
          't5',
          't6',
          't7',
          't8',
          't9',
          't10',
          't11',
          't12',
          't13',
          't14',
          't15',
          't16',
          't17',
          't18',
          't19',
          't20',
          't21',
          't22',
          't23',
          't24',
          't25',
          't26',
          't27',
          't28',
          't29',
          't30',
          't31',
          't32',
        ]);
      });
    });

    describe('When we should not apply the tolerances', function () {
      it('should return an empty list', function () {
        // given
        const shouldApplyTolerances = false;
        const deactivations = Symbol('deactivations');
        // when
        const enabledTolerances = getEnabledTolerances(shouldApplyTolerances, deactivations);

        // then
        expect(enabledTolerances).to.deep.equal([]);
      });
    });
  });

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
});
