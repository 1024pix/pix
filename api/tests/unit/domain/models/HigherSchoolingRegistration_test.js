const HigherSchoolingRegistration = require('../../../../lib/domain/models/HigherSchoolingRegistration');
const { expect, catchErr } = require('../../../test-helper');

describe('Unit | Domain | Models | HigherSchoolingRegistration', () => {

  describe('#validate', () => {

    const buildRegistration = (attributes) => new HigherSchoolingRegistration(attributes);

    const validAttributes = {
      studentNumber: 'A12345',
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2020-01-01',
      organizationId: 123,
    };

    context('when all required fields are presents', () => {
      it('is valid', async () => {
        try {
          new HigherSchoolingRegistration(validAttributes);
        } catch (e) {
          expect.fail('higherSchoolingRegistration is valid when all required fields are present');
        }
      });
    });

    ['firstName', 'lastName', 'birthdate', 'studentNumber'].forEach((field) => {
      it(`throw an error when ${field} is required`, async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, [field]: undefined });

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
      it(`throw an error when string ${field} exceeds 255 characters`, async () => {
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
      it(`throw an error when ${field} is not a string`, async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, [field]: null });

        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_string');
      });
    });

    it('throw an error when organizationId is not an integer', async () => {
      const error = await catchErr(buildRegistration)({ ...validAttributes, organizationId: 12.5 });

      expect(error.key).to.equal('organizationId');
      expect(error.why).to.equal('not_an_integer');
    });

    context('when birthdate is not a date', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: null });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });
    });

    context('when birthdate has not a valid format', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: '2020/02/01' });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('date_format');
      });
    });

    context('when birthdate is null', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, birthdate: null });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });
    });

    context('when email is not correctly formed', () => {
      it('throws an error', async () => {
        const error = await catchErr(buildRegistration)({ ...validAttributes, email: 'sdfsfsdf' });

        expect(error.key).to.equal('email');
        expect(error.why).to.equal('email_format');
      });
    });

    context('student number', () => {
      context('when student number is not correctly formed', () => {
        [
          '#123457',
          '1 23457',
          '1.23457',
          '1,23457E+11',
          'gégé',
        ].forEach((value) => {
          it(`throw an error when student number is ${value}`, async () => {
            const error = await catchErr(buildRegistration)({ ...validAttributes, studentNumber: value });

            expect(error.why).to.equal('student_number_format');
            expect(error.key).to.equal('studentNumber');
          });
        });
      });

      context('when student number is correctly formed', () => {
        [
          '123456',
          '1234aA',
          '1-a-B',
          '1_a_B',
        ].forEach((value) => {
          it(`throw an error when student number is ${value}`, async () => {
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
