import { Criterion } from '../../../../../src/quest/domain/models/Criterion.js';
import { COMPARISONS as CRITERION_PROPERTY_COMPARISONS } from '../../../../../src/quest/domain/models/CriterionProperty.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Criterion ', function () {
  describe('#validate', function () {
    it('should throw if args are not valid', function () {
      expect(() => {
        new Criterion({ data: [] });
      }).to.throw();
    });

    it('should throw without args', function () {
      expect(() => {
        new Criterion();
      }).to.throw();
    });

    it('should not throw if args are valid', function () {
      expect(() => {
        new Criterion({
          data: {
            targetProfileId: {
              data: 1,
              comparison: 'equal',
            },
          },
        });
      }).not.to.throw();
    });
  });

  describe('#check', function () {
    describe('when comparisonFunction is some', function () {
      it('should return true if one data attribute is equal to its criterion attribute', function () {
        const criterion = new Criterion({
          data: {
            something: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
            otherthing: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
          },
        });

        const result = criterion.check({
          item: { something: true, otherthing: false },
          comparisonFunction: 'some',
        });

        expect(result).to.be.true;
      });

      it('should return false if no data attribute are equal to criterion attributes', function () {
        const criterion = new Criterion({
          data: {
            something: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
            otherthing: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
          },
        });

        const result = criterion.check({
          item: { something: false, otherthing: false },
          comparisonFunction: 'some',
        });

        expect(result).to.be.false;
      });
    });

    describe('when comparisonFunction is every', function () {
      it('should return true if data attributes are equal to criterion attributes', function () {
        const criterion = new Criterion({
          data: {
            something: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
            otherthing: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
          },
        });

        const result = criterion.check({
          item: { something: true, otherthing: true },
          comparisonFunction: 'every',
        });

        expect(result).to.be.true;
      });

      it('should return false if data attributes are not equal to criterion attributes', function () {
        const criterion = new Criterion({
          data: {
            something: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
            otherthing: {
              data: true,
              comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
            },
          },
        });

        const result = criterion.check({
          item: { something: true, otherthing: false },
          comparisonFunction: 'every',
        });

        expect(result).to.be.false;
      });
    });
  });

  describe('#toDTO', function () {
    it('should return a DTO version of the criterion', function () {
      // given
      const criterion = new Criterion({
        data: {
          some: {
            data: 'awesome',
            comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
          },
          cool: {
            data: 'stuff',
            comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
          },
        },
      });

      // when
      const DTO = criterion.toDTO();

      // then
      expect(DTO).to.deep.equal({
        some: {
          data: 'awesome',
          comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
        },
        cool: {
          data: 'stuff',
          comparison: CRITERION_PROPERTY_COMPARISONS.EQUAL,
        },
      });
    });
  });
});
