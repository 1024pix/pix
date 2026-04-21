import { COMPARISONS, CriterionProperty } from '../../../../../src/quest/domain/models/CriterionProperty.js';

describe('Quest | Unit | Domain | Models | CriterionProperty', function () {
  describe('#validate', function () {
    describe(COMPARISONS.EQUAL, function () {
      it('should throw with object data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: { object: 'invalid_data' },
            comparison: COMPARISONS.EQUAL,
          });
        }).to.throw();
      });

      it('should throw with array data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: [18, false, 'toto'],
            comparison: COMPARISONS.EQUAL,
          });
        }).to.throw();
      });

      it('should not throw with string data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 'valid',
            comparison: COMPARISONS.EQUAL,
          });
        }).to.not.throw();
      });

      it('should not throw with number data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 18,
            comparison: COMPARISONS.EQUAL,
          });
        }).to.not.throw();
      });
    });

    describe(COMPARISONS.ONE_OF, function () {
      it('should throw with string data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 'invalid',
            comparison: COMPARISONS.ONE_OF,
          });
        }).to.throw();
      });

      it('should throw with object data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: { object: 'invalid_data' },
            comparison: COMPARISONS.ONE_OF,
          });
        }).to.throw();
      });

      it('should throw with number data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 18,
            comparison: COMPARISONS.ONE_OF,
          });
        }).to.throw();
      });

      it('should not throw with array data', function () {
        expect(() => {
          new CriterionProperty({
            key: 'valid_key',
            data: [12, 'toto', false],
            comparison: COMPARISONS.ONE_OF,
          });
        }).not.to.throw();
      });

      it('should throw with empty array data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: [],
            comparison: COMPARISONS.ONE_OF,
          });
        }).to.throw();
      });
    });

    describe(COMPARISONS.LIKE, function () {
      it('should not throw with string data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 'invalid',
            comparison: COMPARISONS.LIKE,
          });
        }).to.not.throw();
      });

      it('should throw with object data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: { object: 'invalid_data' },
            comparison: COMPARISONS.LIKE,
          });
        }).to.throw();
      });

      it('should throw with array data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: [18, 'toto', false],
            comparison: COMPARISONS.LIKE,
          });
        }).to.throw();
      });

      it('should throw with number data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 18,
            comparison: COMPARISONS.LIKE,
          });
        }).to.throw();
      });
    });

    describe(COMPARISONS.ALL, function () {
      it('should throw with string data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 'invalid',
            comparison: COMPARISONS.ALL,
          });
        }).to.throw();
      });

      it('should throw with object data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: { object: 'invalid_data' },
            comparison: COMPARISONS.ALL,
          });
        }).to.throw();
      });

      it('should not throw with array data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: [18, 'toto', false],
            comparison: COMPARISONS.ALL,
          });
        }).to.not.throw();
      });

      it('should throw with empty array data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: [],
            comparison: COMPARISONS.ALL,
          });
        }).to.throw();
      });

      it('should throw with number data', function () {
        expect(function () {
          new CriterionProperty({
            key: 'valid_key',
            data: 18,
            comparison: COMPARISONS.ALL,
          });
        }).to.throw();
      });
    });
  });

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

        it('should return false if data attribute type is not suited for LIKE comparison', function () {
          const criterionProperty = new CriterionProperty({
            key: 'something',
            data: 'ar',
            comparison: COMPARISONS.LIKE,
          });

          const result = criterionProperty.check({ something: false });

          expect(result).to.be.false;
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
