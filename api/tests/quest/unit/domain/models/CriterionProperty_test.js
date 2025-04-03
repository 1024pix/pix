import { InvalidComparisonError } from '../../../../../src/quest/domain/errors.js';
import { COMPARISONS, CriterionProperty } from '../../../../../src/quest/domain/models/CriterionProperty.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | CriterionProperty', function () {
  describe('#check', function () {
    describe('when criterion attribute is not an Array', function () {
      context('when comparison is EQUAL', function () {
        it('should return true if data attribute is equal to criterion attribute', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: true,
            comparison: COMPARISONS.EQUAL,
          });

          const result = criterionProperty.check({ something: true });

          expect(result).to.be.true;
        });

        it('should return false if data attribute is not equal to criterion attribute', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: true,
            comparison: COMPARISONS.EQUAL,
          });

          const result = criterionProperty.check({ something: false });

          expect(result).to.be.false;
        });
      });

      context('when comparison is LIKE', function () {
        it('should return true if criterion attribute is included in data attribute, case insensitive', function () {
          const startsWith = new CriterionProperty({
            key: 'something',
            data: 'I love a',
            comparison: COMPARISONS.LIKE,
          });
          const endsWith = new CriterionProperty({
            key: 'something',
            data: 've apples !',
            comparison: COMPARISONS.LIKE,
          });
          const includes = new CriterionProperty({
            key: 'something',
            data: 'love appl',
            comparison: COMPARISONS.LIKE,
          });
          const caseInsensitive = new CriterionProperty({
            key: 'something',
            data: ' LoVe ApPleS',
            comparison: COMPARISONS.LIKE,
          });

          const result1 = startsWith.check({ something: 'I love apples !' });
          const result2 = endsWith.check({ something: 'I love apples !' });
          const result3 = includes.check({ something: 'I love apples !' });
          const result4 = caseInsensitive.check({ something: 'I love apples !' });

          expect(result1).to.be.true;
          expect(result2).to.be.true;
          expect(result3).to.be.true;
          expect(result4).to.be.true;
        });

        it('should return false if criterion attribute data attribute is not included in data attribute', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: 'ar',
            comparison: COMPARISONS.LIKE,
          });
          const result = criterionProperty.check({ something: 'I love apples !' });

          expect(result).to.be.false;
        });

        it('should return false if data attribute is null or undefined', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: 'ar',
            comparison: COMPARISONS.LIKE,
          });
          const result1 = criterionProperty.check({ something: null });
          const result2 = criterionProperty.check({ somethingElse: null });

          expect(result1).to.be.false;
          expect(result2).to.be.false;
        });

        it('should throw when data attribute type is not suited for LIKE comparison', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: 'ar',
            comparison: COMPARISONS.LIKE,
          });

          expect(() => {
            criterionProperty.check({ something: false });
          }).to.throw(InvalidComparisonError);
        });

        it('should throw when criterion attribute type is not suited for LIKE comparison', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: 456,
            comparison: COMPARISONS.LIKE,
          });

          expect(() => {
            criterionProperty.check({ something: 'coucou' });
          }).to.throw(InvalidComparisonError);
        });
      });
    });

    describe('when criterion attribute is an Array', function () {
      describe('when item attribute is flat', function () {
        it('should return true when item attribute is included in criterion attribute', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: [1, 2],
            comparison: COMPARISONS.ONE_OF,
          });

          const result = criterionProperty.check({ something: 1 });

          expect(result).to.be.true;
        });

        it('should return false when item attribute is not included in criterion attribute', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: [1, 2],
            comparison: COMPARISONS.ONE_OF,
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
              comparison: COMPARISONS.ALL,
            });

            const result = criterionProperty.check({ something: [1, 2, 3] });

            expect(result).to.be.true;
          });

          it('should return false when item attribute does not include all values in criterion attribute', function () {
            const criterionProperty = new CriterionProperty({
              key: 'something',
              data: [1, 2],
              comparison: COMPARISONS.ALL,
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
              comparison: COMPARISONS.ONE_OF,
            });

            const result = criterionProperty.check({ something: [1, 3] });

            expect(result).to.be.true;
          });

          it('should return false when item attribute does not include one of the values in criterion attribute', function () {
            const criterionProperty = new CriterionProperty({
              key: 'something',
              data: [1, 2],
              comparison: COMPARISONS.ONE_OF,
            });

            const result = criterionProperty.check({ something: [3] });

            expect(result).to.be.false;
          });
        });
      });
    });
  });
});
