const HigherSchoolingRegistration = require('../../../../lib/domain/models/HigherSchoolingRegistration');
const { expect, catchErr } = require('../../../test-helper');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | HigherSchoolingRegistration', function() {

  describe('#validate', function() {

    const buildRegistration = (attributes) => new HigherSchoolingRegistration(attributes);

    const validAttributes = {
      studentNumber: 'A12345',
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2020-01-01',
      organizationId: 123,
    };

    context('when all required fields are presents', function() {
      it('is valid', async function() {
        try {
          new HigherSchoolingRegistration(validAttributes);
        } catch (e) {
          expect.fail('higherSchoolingRegistration is valid when all required fields are present');
        }
      });
    });

    ['firstName', 'lastName', 'birthdate', 'studentNumber'].forEach((field) => {
      it(`throw an error when ${field} is required`, async function() {
        const error = await catchErr(buildRegistration)({ ...validAttributes, [field]: undefined, isSupernumerary: false });

        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });
    });

    [
      'studentNumber',
      'firstName',
      'middleName',
      'thirdName',
      'lastName',
      'preferredLastName',
      'email',
      'diploma',
      'department',
      'educationalTeam',
      'group',
      'studyScheme',
    ].forEach((field) => {
      it(`throw an error when string ${field} exceeds 255 characters`, async function() {
        const error = await catchErr(buildRegistration)({ ...validAttributes, [field]: '1'.repeat(256) });

        expect(error.key).to.equal(field);
        expect(error.why).to.equal('max_length');
        expect(error.limit).to.equal(255);
      });
    });

    [
      'studentNumber',
      'firstName',
      'middleName',
      'thirdName',
      'lastName',
      'preferredLastName',
      'email',
      'diploma',
      'department',
      'educationalTeam',
      'group',
      'studyScheme',
    ].forEach((field) => {
      it(`throw an error when ${field} is not a string`, async function() {
        const error = await catchErr(buildRegistration)({ ...validAttributes, [field]: null });

        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_string');
      });
    });

    it('throw an error when organizationId is not an integer', async function() {
      const error = await catchErr(buildRegistration)({ ...validAttributes, organizationId: 12.5 });

      expect(error.key).to.equal('organizationId');
      expect(error.why).to.equal('not_an_integer');
    });

    it('throw an error when isSupernumerary is not a boolean', async function() {
      const error = await catchErr(buildRegistration)({ ...validAttributes, isSupernumerary: 'saaaaluuuut' });

      expect(error.key).to.equal('isSupernumerary');
      expect(error.why).to.equal('not_a_boolean');
    });

    context('when isSupernumerary is true', function() {
      context('when student number is not present', function() {
        it('is valid', async function() {
          try {
            await buildRegistration({ ...validAttributes, studentNumber: null, isSupernumerary: true });
          } catch (e) {
            expect.fail('higherSchoolingRegistration is valid when all required fields are present');
          }
        });
      });

      context('when student number is present', function() {
        it('is valid', async function() {
          try {
            await buildRegistration({ ...validAttributes, studentNumber: '1234', isSupernumerary: true });
          } catch (e) {
            expect.fail('higherSchoolingRegistration is valid when all required fields are present');
          }
        });
      });
    });

    context('when isSupernumerary is false', function() {
      context('when student number is not present', function() {
        it('throws an error', async function() {
          const error = await catchErr(buildRegistration)({ ...validAttributes, studentNumber: null, isSupernumerary: false });

          expect(error).to.be.instanceOf(EntityValidationError);
        });
      });

      context('when student number is present', function() {
        it('is valid', async function() {
          try {
            await buildRegistration({ ...validAttributes, studentNumber: '1234', isSupernumerary: false });
          } catch (e) {
            expect.fail('higherSchoolingRegistration is valid when all required fields are present');
          }
        });
      });
    });

    context('when birthdate is not a date', function() {
      it('throws an error', async function() {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: null });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });
    });

    context('when birthdate has not a valid format', function() {
      it('throws an error', async function() {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: '2020/02/01' });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('date_format');
      });
    });

    context('when birthdate is null', function() {
      it('throws an error', async function() {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: null });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });
    });

    context('when email is not correctly formed', function() {
      it('throws an error', async function() {
        const error = await catchErr(buildRegistration)({ ...validAttributes, email: 'sdfsfsdf' });

        expect(error.key).to.equal('email');
        expect(error.why).to.equal('email_format');
      });
    });

    context('student number', function() {
      context('when student number is not correctly formed', function() {
        [
          '#123457',
          '1 23457',
          '1.23457',
          '1,23457E+11',
          'gégé',
        ].forEach((value) => {
          it(`throw an error when student number is ${value}`, async function() {
            const error = await catchErr(buildRegistration)({ ...validAttributes, studentNumber: value });

            expect(error.why).to.equal('student_number_format');
            expect(error.key).to.equal('studentNumber');
          });
        });
      });

      context('when student number is correctly formed', function() {
        [
          '123456',
          '1234aA',
          '1-a-B',
          '1_a_B',
        ].forEach((value) => {
          it(`throw an error when student number is ${value}`, async function() {
            try {
              await buildRegistration({ ...validAttributes, studentNumber: value });
            } catch (e) {
              expect.fail('higherSchoolingRegistration is valid when student number is correctly formed');
            }
          });
        });
      });
    });
  });
});
