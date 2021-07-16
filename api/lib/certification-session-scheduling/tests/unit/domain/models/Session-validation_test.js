const { Session } = require('../../../../domain/models/Session');
const { expect } = require('../../../../../../tests/test-helper.js');
const { ObjectValidationError } = require('../../../../domain/errors/ObjectValidationError');

describe('Unit | Domain | Models | Session | validation', () => {

  describe('#validate', () => {

    let validAttributes;

    beforeEach(() => {
      validAttributes = {
        id: 123,
        certificationCenterId: 456,
        certificationCenter: 'Centre des Anne-Etoiles', // vieillerie, ne plus l'écrire en BDD
        accessCode: 'AZER12',
        address: '3 rue des Églantines',
        examiner: 'Big Brother',
        room: 'A20',
        date: '2021-01-01',
        time: '12:00',
        description: 'Session de certification',
      };
    });

    it('passes when attributes are all valid', () => {
      // when / then
      expect(() => new Session(validAttributes)).not.to.throw();
    });

    [
      'certificationCenterId',
      'accessCode',
      'address',
      'examiner',
      'room',
      'date',
      'time',
    ].forEach((missingValue) => {
      it(`rejects missing ${missingValue}`, () => {
        // given
        const attributes = {
          ...validAttributes,
        };
        delete attributes[missingValue];

        // when / then
        expect(() => new Session(attributes)).to.throw(ObjectValidationError);
      });
    });

    const invalidValuesByKey = {
      id: ['test', -1, 1.5, 0, undefined],
      certificationCenterId: ['test', -1, 1.5, 0, null, undefined],
      address: [123, '', null, undefined],
      examiner: [123, '', null, undefined],
      room: [123, '', null, undefined],
      date: [new Date(), 123, '', 'wrong format', null, undefined],
      time: ['12:00:05', 123, '', 'wrong format', null, undefined],
    };

    for (const key in invalidValuesByKey) {
      for (const invalidValue of invalidValuesByKey[key]) {
        it(`rejects wrong ${key} ${invalidValue}`, () => {
          // when / then
          expect(() => new Session({
            ...validAttributes,
            [key]: invalidValue,
          })).to.throw(ObjectValidationError);
        });
      }
    }
  });
});
