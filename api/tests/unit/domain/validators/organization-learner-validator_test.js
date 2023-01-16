const { expect, catchErr } = require('../../../test-helper');
const {
  checkValidation,
  FRANCE_COUNTRY_CODE,
} = require('../../../../lib/domain/validators/organization-learner-validator');

describe('Unit | Domain | Organization Learner validator', function () {
  context('#checkValidation', function () {
    const validAttributes = {
      nationalIdentifier: '12345',
      firstName: 'Ellen',
      lastName: 'Ripley',
      sex: 'F',
      birthdate: '1979-05-25',
      organizationId: 1,
      birthCity: 'city1',
      birthCityCode: 'city1',
      birthProvinceCode: '10',
      birthCountryCode: '99125',
      status: 'ST',
      MEFCode: 'ABCDE',
      division: 'EDCBA',
    };

    context('when all required fields are presents', function () {
      it('is valid', async function () {
        try {
          checkValidation(validAttributes);
        } catch (e) {
          expect.fail('OrganizationLearner is valid when all required fields are present');
        }
      });
    });

    context('required fields', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        'firstName',
        'lastName',
        'sex',
        'birthdate',
        'nationalIdentifier',
        'birthProvinceCode',
        'birthProvinceCode',
        'status',
        'MEFCode',
        'division',
        'organizationId',
      ].forEach((field) => {
        it(`throw an error when ${field} is missing`, async function () {
          const error = await catchErr(checkValidation)({ ...validAttributes, [field]: undefined });

          expect(error.key).to.equal(field);
          expect(error.why).to.equal('required');
        });
      });
    });

    context('fields with a a max length of 255 characters', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        'firstName',
        'middleName',
        'thirdName',
        'lastName',
        'preferredLastName',
        'nationalIdentifier',
        'birthCity',
        'MEFCode',
        'division',
      ].forEach((field) => {
        it(`throw an error when ${field} has more than 255 characters`, async function () {
          const error = await catchErr(checkValidation)({ ...validAttributes, [field]: '1'.repeat(256) });

          expect(error.key).to.equal(field);
          expect(error.why).to.equal('max_length');
        });
      });
    });

    context('birthProvinceCode', function () {
      it('throw an error when birthProvinceCode has more than 3 characters', async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthProvinceCode: '1234' });

        expect(error.key).to.equal('birthProvinceCode');
        expect(error.why).to.equal('max_length');
        expect(error.limit).to.equal(3);
      });

      it('throw an error when birthProvinceCode has lass than 2 characters', async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthProvinceCode: '1' });
        expect(error.key).to.equal('birthProvinceCode');
        expect(error.why).to.equal('min_length');
        expect(error.limit).to.equal(2);
      });
    });

    context('birthCountryCode', function () {
      context('is valid', function () {
        it('respects INSEE Code, only number', async function () {
          try {
            checkValidation({ ...validAttributes, birthCountryCode: '99123' });
          } catch (e) {
            expect.fail('OrganizationLearner is valid birthCountryCode respect INSEE code');
          }
        });
      });

      it('throw an error when birthCountryCode before birthCityCode', async function () {
        const error = await catchErr(checkValidation)({
          ...validAttributes,
          birthCityCode: '',
          birthCountryCode: '12345',
        });

        expect(error.key).to.equal('birthCountryCode');
        expect(error.why).to.equal('not_valid_insee_code');
      });

      it('throw an error when birthCountryCode before birthCity', async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthCity: '', birthCountryCode: '12345' });

        expect(error.key).to.equal('birthCountryCode');
        expect(error.why).to.equal('not_valid_insee_code');
      });

      it('throw an error when birthCountryCode has not 5 characters', async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthCountryCode: '123456' });

        expect(error.key).to.equal('birthCountryCode');
        expect(error.why).to.equal('length');
        expect(error.limit).to.equal(5);
      });

      it('throw an error when birthCountryCode not start with 99', async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthCountryCode: '88123' });

        expect(error.key).to.equal('birthCountryCode');
        expect(error.why).to.equal('not_valid_insee_code');
      });

      it('throw an error when birthCountryCode contains letter', async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, birthCountryCode: '2B122' });

        expect(error.key).to.equal('birthCountryCode');
        expect(error.why).to.equal('not_valid_insee_code');
      });
    });

    context('status', function () {
      it("throw an error when status is not 'ST'", async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, status: 'AA' });

        expect(error.key).to.equal('status');
        expect(error.why).to.equal('bad_values');
      });

      it("is valid when status is 'ST'", async function () {
        try {
          checkValidation({ ...validAttributes, status: 'ST' });
        } catch (e) {
          expect.fail("OrganizationLearner is valid when status is 'ST'");
        }
      });

      it("is valid when status is 'AP'", async function () {
        try {
          checkValidation({ ...validAttributes, nationalIdentifier: '0123456789F', status: 'AP' });
        } catch (e) {
          expect.fail("OrganizationLearner is valid when status is 'AP'");
        }
      });
    });

    context('sex', function () {
      it("throw an error when status is not 'F', 'f', 'M' or 'm'", async function () {
        const error = await catchErr(checkValidation)({ ...validAttributes, sex: 'AA' });

        expect(error.key).to.equal('sex');
        expect(error.why).to.equal('bad_values');
      });

      it("is valid when status is 'F'", async function () {
        try {
          checkValidation({ ...validAttributes, sex: 'F' });
        } catch (e) {
          expect.fail("OrganizationLearner is valid when status is 'F'");
        }
      });

      it("is valid when status is 'f'", async function () {
        try {
          checkValidation({ ...validAttributes, sex: 'f' });
        } catch (e) {
          expect.fail("OrganizationLearner is valid when status is 'f'");
        }
      });

      it("is valid when status is 'M'", async function () {
        try {
          checkValidation({ ...validAttributes, sex: 'M' });
        } catch (e) {
          expect.fail("OrganizationLearner is valid when status is 'M'");
        }
      });

      it("is valid when status is 'm'", async function () {
        try {
          checkValidation({ ...validAttributes, sex: 'm' });
        } catch (e) {
          expect.fail("OrganizationLearner is valid when status is 'm'");
        }
      });
    });

    context('birthdate', function () {
      context('when birthdate is not a date', function () {
        it('throws an error', async function () {
          const error = await catchErr(checkValidation)({ ...validAttributes, birthdate: '123456' });

          expect(error.key).to.equal('birthdate');
          expect(error.why).to.equal('not_a_date');
        });
      });

      context('when birthdate has not a valid format', function () {
        it('throws an error', async function () {
          const error = await catchErr(checkValidation)({ ...validAttributes, birthdate: '2020/01/01' });

          expect(error.key).to.equal('birthdate');
          expect(error.why).to.equal('not_a_date');
        });
      });

      context('when birthdate is null', function () {
        it('throws an error', async function () {
          const error = await catchErr(checkValidation)({ ...validAttributes, birthdate: null });

          expect(error.key).to.equal('birthdate');
          expect(error.why).to.equal('required');
        });
      });
    });

    context('birthCity', function () {
      it('throw an error when birth country is not France and birthCity is undefined', async function () {
        const error = await catchErr(checkValidation)({
          ...validAttributes,
          birthCountryCode: '99125',
          birthCity: undefined,
        });

        expect(error.key).to.equal('birthCity');
        expect(error.why).to.equal('required');
      });

      it('is valid when birthCity is undefined and birthCountry is France', async function () {
        try {
          checkValidation({
            ...validAttributes,
            birthCountryCode: FRANCE_COUNTRY_CODE,
            birthCityCode: '51430',
            birthCity: undefined,
          });
        } catch (e) {
          expect.fail('OrganizationLearner is valid when birthCity is undefined and birthCountry is France');
        }
      });
    });

    context('birthCityCode', function () {
      context('is valid', function () {
        context('when birthCountryCode equal to France', function () {
          it('respects INSEE Code, with one letter', async function () {
            try {
              checkValidation({ ...validAttributes, birthCountryCode: FRANCE_COUNTRY_CODE, birthCityCode: '2B125' });
            } catch (e) {
              expect.fail('OrganizationLearner is valid birthCityCode respect INSEE code, like Corsica');
            }
          });

          it('respects INSEE Code, only number', async function () {
            try {
              checkValidation({ ...validAttributes, birthCountryCode: FRANCE_COUNTRY_CODE, birthCityCode: '13125' });
            } catch (e) {
              expect.fail('OrganizationLearner is valid birthCityCode respect INSEE code, like Corsica');
            }
          });
        });

        context('when birthCountryCode not equal to France', function () {
          it('is valid with birthCityCode undefined', async function () {
            try {
              checkValidation({ ...validAttributes, birthCountryCode: '99125', birthCityCode: undefined });
            } catch (e) {
              expect.fail('OrganizationLearner is valid when birthCity is undefined and birthCountry is not France');
            }
          });
        });
      });

      context('is invalid', function () {
        context('when birthCountryCode is equal to France', function () {
          it('throw an error with a birthCityCode of 5 characters', async function () {
            const error = await catchErr(checkValidation)({
              ...validAttributes,
              birthCountryCode: FRANCE_COUNTRY_CODE,
              birthCityCode: '123456',
            });

            expect(error.key).to.equal('birthCityCode');
            expect(error.why).to.equal('length');
            expect(error.limit).to.equal(5);
          });

          it('throws an error with a birthCityCode which has a letter not in second character', async function () {
            const error = await catchErr(checkValidation)({
              ...validAttributes,
              birthCountryCode: FRANCE_COUNTRY_CODE,
              birthCityCode: '21B22',
            });

            expect(error.key).to.equal('birthCityCode');
            expect(error.why).to.equal('not_valid_insee_code');
          });
        });

        context('when birthCountryCode is not equal to France', function () {
          it('throws an error with a birthCityCode of 256 characters', async function () {
            const stringOf256Char =
              'hZSJIp6WBhnZFxsnTxEQo1oSoWkRDSB8nQsbScrK9IfAmVGb1PFNdX333k6Tsn6YKHfebdRg2VryzQcY06GTm1sYIN9Y3B0uy1ZsZIFpZ3cQNLxnawaUfVQFylq1GFba9LNDowH7lISfn7HJbdf3hNawofdCbVNgRdw7ZAN8XdggDJUgyAs91GpQ6vCkrxa08AMYTI8QClkhUVazVGgwndtwN4EBG23K2AfayHKWVi6jSlPOgUrx4tgSAcxELxW2';
            const error = await catchErr(checkValidation)({ ...validAttributes, birthCityCode: stringOf256Char });

            expect(error.key).to.equal('birthCityCode');
            expect(error.why).to.equal('max_length');
            expect(error.limit).to.equal(255);
          });
        });
      });
    });
  });
});
