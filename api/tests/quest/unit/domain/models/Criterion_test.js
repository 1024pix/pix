import { Criterion } from '../../../../../src/quest/domain/models/Criterion.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Criterion ', function () {
  describe('#check', function () {
    describe('when comparisonFunction is some', function () {
      it('should return true if one data attribute is equal to its criterion attribute', function () {
        const criterion = new Criterion({
          data: {
            something: true,
            otherthing: true,
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
            something: true,
            otherthing: true,
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
            something: true,
            otherthing: true,
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
            something: true,
            otherthing: true,
          },
        });

        const result = criterion.check({
          item: { something: true, otherthing: false },
          comparisonFunction: 'every',
        });

        expect(result).to.be.false;
      });
    });

    describe('when criterion attribute is not an Array', function () {
      it('should return true if data attribute is equal to criterion attribute', function () {
        const criterion = new Criterion({
          data: {
            something: true,
          },
        });

        const result = criterion.check({
          item: { something: true },
          comparisonFunction: 'every',
        });

        expect(result).to.be.true;
      });

      it('should return false if data attribute is not equal to criterion attribute', function () {
        const criterion = new Criterion({
          data: {
            something: true,
          },
        });

        const result = criterion.check({
          item: { something: false },
          comparisonFunction: 'every',
        });

        expect(result).to.be.false;
      });
    });

    describe('when criterion attribute is an Array', function () {
      describe('when item attribute is flat', function () {
        it('should return true when item attribute is included in criterion attribute', function () {
          const criterion = new Criterion({
            data: {
              something: [1, 2],
            },
          });

          const result = criterion.check({
            item: { something: 1 },
            comparisonFunction: 'every',
          });

          expect(result).to.be.true;
        });

        it('should return false when item attribute is not included in criterion attribute', function () {
          const criterion = new Criterion({
            data: {
              something: [1, 2],
            },
          });

          const result = criterion.check({
            item: { something: 3 },
            comparisonFunction: 'every',
          });

          expect(result).to.be.false;
        });
      });

      describe('when item attribute value is an Array', function () {
        it('should return true when item attribute includes all values in criterion attribute', function () {
          const criterion = new Criterion({
            data: {
              something: [1, 2],
            },
          });

          const result = criterion.check({
            item: { something: [1, 2, 3] },
            comparisonFunction: 'every',
          });

          expect(result).to.be.true;
        });

        it('should return false when item attribute does not include all values in criterion attribute', function () {
          const criterion = new Criterion({
            data: {
              something: [1, 2],
            },
          });

          const result = criterion.check({
            item: { something: [1, 3] },
            comparisonFunction: 'every',
          });

          expect(result).to.be.false;
        });
      });
    });
  });

  describe('#toDTO', function () {
    it('should return a DTO version of the criterion', function () {
      // given
      const criterion = new Criterion({
        data: { some: 'awesome', cool: 'stuff' },
      });

      // when
      const DTO = criterion.toDTO();

      // then
      expect(DTO).to.deep.equal({ some: 'awesome', cool: 'stuff' });
    });
  });
});
