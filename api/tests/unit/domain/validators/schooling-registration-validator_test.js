const { expect, catchErr } = require('../../../test-helper');
const { checkValidation } = require('../../../../lib/domain/validators/schooling-registration-validator');

describe('Unit | Domain | Schooling Registration validator', () => {
  context('#checkValidation', () => {

    const validAttributes = {
      nationalIdentifier: '12345',
      firstName: 'Ellen',
      lastName: 'Ripley',
      birthdate: '1979-05-25',
      organizationId: 1,
      birthCity: 'city1',
      birthCityCode: 'city1',
      birthProvinceCode: '10',
      birthCountryCode: '12345',
      status: 'ST',
      MEFCode: 'ABCDE',
      division: 'EDCBA',
    };
    
    context('when all required fields are presents', () => {
      it('is valid', async () => {
        try {
          checkValidation(validAttributes);
        } catch (e) {
          expect.fail('SchoolingRegistration is valid when all required fields are present');
        }
      });
    });

    context('required fields', () => {
      ['firstName', 'lastName', 'birthdate', 'nationalIdentifier', 'birthProvinceCode', 'birthProvinceCode', 'status', 'MEFCode', 'division', 'organizationId'].forEach((field) => {
        it(`throw an error when ${field} is missing`, async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, [field]: undefined });

          expect(error.key).to.equal(field);
          expect(error.why).to.equal('required');
        });
      });
    });

    context('fields with a a max length of 255 characters', () => {
      ['firstName', 'middleName', 'thirdName', 'lastName', 'preferredLastName', 'nationalIdentifier', 'birthCity', 'MEFCode', 'division'].forEach((field) => {
        it(`throw an error when ${field} has more than 255 characters`, async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, [field]: '1'.repeat(256) });

          expect(error.key).to.equal(field);
          expect(error.why).to.equal('max_length');
        });
      });
    });

    context('nationalIdentifier', () => {
      context('nationalIdentifier is a National Student Id', () => {
        it('should be valid when National Student Id is not an apprentice', async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, nationalIdentifier: '1234', status: 'ST' });
        
          expect(error.key).to.be.undefined;
        });
      });

      context('nationalIdentifier is a National Apprentice Id', () => {
        it('should be valid when National Apprentice Id has the correct pattern', async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, nationalIdentifier: '0123456789A', status: 'AP' });
        
          expect(error.key).to.be.undefined;
        });
      
        it('throw an error when National Apprentice Id has not the correct pattern', async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, nationalIdentifier: '1234', status: 'AP' });
  
          expect(error.key).to.equal('nationalIdentifier');
          expect(error.why).to.equal('bad_pattern');
          expect(error.pattern).to.equal('INA');
        });
      });
    });

    context('birthProvinceCode', () => {
      it('throw an error when birthProvinceCode has more than 3 characters', async () => {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthProvinceCode: '1234' });

        expect(error.key).to.equal('birthProvinceCode');
        expect(error.why).to.equal('max_length');
        expect(error.limit).to.equal(3);
      });

      it('throw an error when birthProvinceCode has lass than 2 characters', async () => {

        const error = await catchErr(checkValidation)({ ...validAttributes, birthProvinceCode: '1' });
        expect(error.key).to.equal('birthProvinceCode');
        expect(error.why).to.equal('min_length');
        expect(error.limit).to.equal(2);
      });
    });

    context('birthCountryCode', () => {
      it('throw an error when birthCountryCode has not 5 characters', async () => {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthCountryCode: '123456' });

        expect(error.key).to.equal('birthCountryCode');
        expect(error.why).to.equal('length');
        expect(error.limit).to.equal(5);
      });
    });

    context('status', () => {
      it('throw an error when status is not \'ST\'', async () => {
        const error = await catchErr(checkValidation)({ ...validAttributes, status: 'AA' });

        expect(error.key).to.equal('status');
        expect(error.why).to.equal('bad_values');
      });

      it('is valid when status is \'ST\'', async () => {
        try {
          checkValidation({ ...validAttributes, status: 'ST' });
        } catch (e) {
          expect.fail('SchoolingRegistration is valid when status is \'ST\'');
        }
      });

      it('is valid when status is \'AP\'', async () => {
        try {
          checkValidation({ ...validAttributes, nationalIdentifier: '0123456789F', status: 'AP' });
        } catch (e) {
          expect.fail('SchoolingRegistration is valid when status is \'AP\'');
        }
      });
    });

    context('birthdate',() => {
      context('when birthdate is not a date', () => {
        it('throws an error', async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, birthdate: '123456' });

          expect(error.key).to.equal('birthdate');
          expect(error.why).to.equal('not_a_date');
        });
      });

      context('when birthdate has not a valid format', () => {
        it('throws an error', async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, birthdate: '2020/01/01' });

          expect(error.key).to.equal('birthdate');
          expect(error.why).to.equal('not_a_date');
        });
      });

      context('when birthdate is null', () => {
        it('throws an error', async () => {
          const error = await catchErr(checkValidation)({ ...validAttributes, birthdate: null });

          expect(error.key).to.equal('birthdate');
          expect(error.why).to.equal('required');
        });
      });
    });

    context('birthCity', () => {
      it('throw an error when birth country is not France and birthCity is undefined', async () => {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthCountryCode: '12345', birthCity: undefined });

        expect(error.key).to.equal('birthCity');
        expect(error.why).to.equal('required');
      });

      it('is valid when birthCity is undefined and birthCountry is France', async () => {
        const franceCountryCode = '99100';

        try {
          checkValidation({ ...validAttributes, birthCountryCode: franceCountryCode, birthCity: undefined });
        } catch (e) {
          expect.fail('SchoolingRegistration is valid when birthCity is undefined and birthCountry is France');
        }
      });
    });

    context('birthCityCode', () => {
      it('throw an error when birthCityCode is not France and birthCity is undefined', async () => {
        const franceCountryCode = '99100';

        const error = await catchErr(checkValidation)({ ...validAttributes, birthCountryCode: franceCountryCode, birthCityCode: undefined });

        expect(error.key).to.equal('birthCityCode');
        expect(error.why).to.equal('required');
      });

      it('is valid when birthCityCode is undefined and birthCountry is not France', async () => {

        try {
          checkValidation({ ...validAttributes, birthCountryCode: '12345', birthCityCode: undefined });
        } catch (e) {
          expect.fail('SchoolingRegistration is valid when birthCity is undefined and birthCountry is not France');
        }
      });

      it('throw an error when birthCityCode has not 5 characters', async () => {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthCityCode: '1' });

        expect(error.key).to.equal('birthCityCode');
        expect(error.why).to.equal('length');
        expect(error.limit).to.equal(5);
      });
    });
  });
});
