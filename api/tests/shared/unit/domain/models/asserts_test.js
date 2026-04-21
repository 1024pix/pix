import { DomainError } from '../../../../../src/shared/domain/errors.js';
import {
  assertEnumValue,
  assertHasUuidLength,
  assertInstanceOf,
  assertIsArray,
  assertNotNullOrUndefined,
  assertPositiveInteger,
} from '../../../../../src/shared/domain/models/asserts.js';

import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Unit | Shared | Models | asserts', function () {
  describe('#assertNotNullOrUndefined', function () {
    describe('given invalid values', function () {
      [null, undefined].forEach(function (input) {
        it(`"${input}" should throw`, function () {
          expect(() => assertNotNullOrUndefined(input)).to.throw();
        });
      });
    });

    describe('given valid values', function () {
      [0, '', false, [], {}, NaN].forEach(function (input) {
        it(`"${input}" should not throw`, function () {
          expect(() => assertNotNullOrUndefined(input)).not.to.throw();
        });
      });
    });
  });

  describe('#assertEnumValue', function () {
    describe('given invalid value', function () {
      it('should throw', function () {
        // given
        const anEnum = { X: 'y' };

        // When, Then
        expect(() => assertEnumValue(anEnum, 'z')).to.throw();
      });
    });

    describe('given invalid value with custom error message', function () {
      it('should throw', function () {
        // given
        const errorMessage = 'This is an error with my custom message';
        const anEnum = { X: 'y' };

        // When
        const error = catchErrSync(() => assertEnumValue(anEnum, 'z', errorMessage))();

        // Then
        expect(error).to.be.instanceOf(TypeError);
        expect(error.message).to.equal('This is an error with my custom message');
      });
    });

    describe('given valid values', function () {
      it('should not throw', function () {
        // given
        const anEnum = { X: 'y' };

        // When, Then
        expect(() => assertEnumValue(anEnum, 'y')).not.to.throw();
      });
    });
  });

  describe('#assertInstanceOf', function () {
    describe('given invalid value', function () {
      it('should throw', function () {
        // given
        const anEnum = {};

        // When, Then
        expect(() => assertInstanceOf(anEnum, Date)).to.throw();
      });
    });

    describe('given valid values', function () {
      it('should not throw', function () {
        // given
        const aDate = new Date();

        // When, Then
        expect(() => assertInstanceOf(aDate, Date)).not.to.throw();
      });
    });
  });

  describe('#assertHasUuidLength', function () {
    describe('given invalid value', function () {
      it('should throw', function () {
        // given
        const value = '00e0c3fa-d812-45c8-b0cc-f317004988f9d';

        // when
        const error = catchErrSync(() => assertHasUuidLength(value))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('Uuid value must be exactly 36 characters long');
      });
    });

    describe('given invalid value and a custom error message', function () {
      it('should throw withe the custom error message', function () {
        // given
        const value = '00e0c3fa-d812-45c8-b0cc-f317004988';

        // when
        const error = catchErrSync(() => assertHasUuidLength(value, 'NOPE'))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('NOPE');
      });
    });

    describe('given valid value', function () {
      it('should not throw', function () {
        // given
        const value = '00e0c3fa-d812-45c8-b0cc-f317004988f9';

        // when/then
        expect(() => assertHasUuidLength(value)).not.to.throw();
      });
    });
  });

  describe('#assertPositiveInteger', function () {
    describe('given invalid value', function () {
      it('should throw', function () {
        // given
        const value = 0;

        // when
        const error = catchErrSync(() => assertPositiveInteger(value))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('value must be a positive integer');
      });

      describe('given undefined', function () {
        it('should throw', function () {
          // given
          const value = undefined;

          // when
          const error = catchErrSync(() => assertPositiveInteger(value))();

          // then
          expect(error).to.be.instanceOf(DomainError);
          expect(error.message).to.equal('value must be a positive integer');
        });
      });

      describe('given negative number', function () {
        it('should throw', function () {
          // given
          const value = -1;

          // when
          const error = catchErrSync(() => assertPositiveInteger(value))();

          // then
          expect(error).to.be.instanceOf(DomainError);
          expect(error.message).to.equal('value must be a positive integer');
        });
      });

      describe('given zero', function () {
        it('should throw', function () {
          // given
          const value = 0;

          // when
          const error = catchErrSync(() => assertPositiveInteger(value))();

          // then
          expect(error).to.be.instanceOf(DomainError);
          expect(error.message).to.equal('value must be a positive integer');
        });
      });

      describe('given positive floating number', function () {
        it('should throw', function () {
          // given
          const value = 1.5;

          // when
          const error = catchErrSync(() => assertPositiveInteger(value))();

          // then
          expect(error).to.be.instanceOf(DomainError);
          expect(error.message).to.equal('value must be a positive integer');
        });
      });
    });

    describe('given invalid value and a custom error message', function () {
      it('should throw with the custom error message', function () {
        // given
        const value = 0;

        // when
        const error = catchErrSync(() => assertPositiveInteger(value, 'NOPE'))();

        // then
        expect(error).to.be.instanceOf(DomainError);
        expect(error.message).to.equal('NOPE');
      });
    });

    describe('given valid value', function () {
      it('should not throw', function () {
        // given
        const value = 5;

        // when/then
        expect(() => assertPositiveInteger(value)).not.to.throw();
      });
    });
  });

  describe('#assertIsArray', function () {
    describe('given invalid values', function () {
      [null, undefined, 'azerty'].forEach(function (input) {
        it(`"${input}" should throw`, function () {
          expect(() => assertIsArray(input)).to.throw();
        });
      });
    });

    describe('given valid values', function () {
      [[]].forEach(function (input) {
        it(`"${input}" should not throw`, function () {
          expect(() => assertIsArray(input)).not.to.throw();
        });
      });
    });
  });
});
