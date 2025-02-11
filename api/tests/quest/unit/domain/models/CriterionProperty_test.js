import { COMPARISON, CriterionProperty } from '../../../../../src/quest/domain/models/CriterionProperty.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CriterionProperty', function () {
  describe('#check', function () {
    describe('when criterion attribute is not an Array', function () {
      it('should return true if data attribute is equal to criterion attribute', function () {
        const criterionProperty = new CriterionProperty({
          key: 'something',
          data: true,
          comparison: COMPARISON.EQUAL,
        });

        const result = criterionProperty.check({ something: true });

        expect(result).to.be.true;
      });

      it('should return false if data attribute is not equal to criterion attribute', function () {
        const criterionProperty = new CriterionProperty({
          key: 'something',
          data: true,
          comparison: COMPARISON.EQUAL,
        });

        const result = criterionProperty.check({ something: false });

        expect(result).to.be.false;
      });
    });

    describe('when criterion attribute is an Array', function () {
      describe('when item attribute is flat', function () {
        it('should return true when item attribute is included in criterion attribute', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: [1, 2],
            comparison: COMPARISON.ONE_OF,
          });

          const result = criterionProperty.check({ something: 1 });

          expect(result).to.be.true;
        });

        it('should return false when item attribute is not included in criterion attribute', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: [1, 2],
            comparison: COMPARISON.ONE_OF,
          });

          const result = criterionProperty.check({ something: 3 });

          expect(result).to.be.false;
        });
      });

      describe('when item attribute value is an Array', function () {
        describe('when comparison is ALL', function () {
          it('should return true when item attribute includes all values in criterion attribute', function () {
            const criterionProperty = new CriterionProperty({
              key: 'something',
              data: [1, 2],
              comparison: COMPARISON.ALL,
            });

            const result = criterionProperty.check({ something: [1, 2, 3] });

            expect(result).to.be.true;
          });

          it('should return false when item attribute does not include all values in criterion attribute', function () {
            const criterionProperty = new CriterionProperty({
              key: 'something',
              data: [1, 2],
              comparison: COMPARISON.ALL,
            });

            const result = criterionProperty.check({ something: [1, 3] });

            expect(result).to.be.false;
          });
        });

        describe('when comparison is ONE_OF', function () {
          it('should return true when item attribute includes at least one of the values in criterion attribute', function () {
            const criterionProperty = new CriterionProperty({
              key: 'something',
              data: [1, 2],
              comparison: COMPARISON.ONE_OF,
            });

            const result = criterionProperty.check({ something: [1, 3] });

            expect(result).to.be.true;
          });

          it('should return false when item attribute does not include one of the values in criterion attribute', function () {
            const criterionProperty = new CriterionProperty({
              key: 'something',
              data: [1, 2],
              comparison: COMPARISON.ONE_OF,
            });

            const result = criterionProperty.check({ something: [3] });

            expect(result).to.be.false;
          });
        });
      });
    });
  });
});
