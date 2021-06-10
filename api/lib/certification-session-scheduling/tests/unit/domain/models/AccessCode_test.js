const { AccessCode } = require('../../../../domain/models/AccessCode');
const { expect } = require('../../../../../../tests/test-helper.js');
const { ObjectValidationError } = require('../../../../domain/errors/ObjectValidationError');
const random = require('../../../../infrastructure/random');

describe('Unit | Domain | Models | AccessCode', function() {

  context('#validate', () => {

    let validAttributes;

    beforeEach(() => {
      validAttributes = {
        value: 'ANNE66',
      };
    });

    it('passes when attributes are all valid', () => {
      // when / then
      expect(() => new AccessCode(validAttributes)).not.to.throw();
    });

    [
      '1NNE66',
      'A1NE66',
      'AN1E66',
      'ANN166',
      'ANNEA6',
      'ANNE6A',
    ].forEach((wrongValue) => {
      it(`rejects when code does not consist of 4 letters at the beginning followed by 2 numbers ${wrongValue}`, () => {
        // when / then
        expect(() => new AccessCode({
          ...validAttributes,
          value: wrongValue,
        })).to.throw(ObjectValidationError);
      });
    });
  });

  context('#static generate ', () => {

    it('should return an AccessCode with a generated value', () => {
      // when
      const accessCode = AccessCode.generate(random.pickOneFrom);

      // then
      expect(accessCode).to.be.instanceOf(AccessCode);
    });
  });
});
