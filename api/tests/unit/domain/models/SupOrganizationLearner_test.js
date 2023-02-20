import SupOrganizationLearner from '../../../../lib/domain/models/SupOrganizationLearner';
import { expect, catchErr } from '../../../test-helper';

describe('Unit | Domain | Models | SupOrganizationLearner', function () {
  describe('#validate', function () {
    const buildOrganizationLearner = (attributes) => new SupOrganizationLearner(attributes);

    const validAttributes = {
      studentNumber: 'A12345',
      firstName: 'Oren',
      lastName: 'Ishii',
      birthdate: '2020-01-01',
      organizationId: 123,
    };

    context('when all required fields are presents', function () {
      it('is valid', async function () {
        try {
          new SupOrganizationLearner(validAttributes);
        } catch (e) {
          expect.fail('supOrganizationLearner is valid when all required fields are present');
        }
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['firstName', 'lastName', 'birthdate', 'studentNumber'].forEach((field) => {
      it(`throw an error when ${field} is required`, async function () {
        const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, [field]: undefined });

        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
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
      it(`throw an error when string ${field} exceeds 255 characters`, async function () {
        const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, [field]: '1'.repeat(256) });

        expect(error.key).to.equal(field);
        expect(error.why).to.equal('max_length');
        expect(error.limit).to.equal(255);
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
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
      it(`throw an error when ${field} is not a string`, async function () {
        const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, [field]: null });

        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_string');
      });
    });

    it('throw an error when organizationId is not an integer', async function () {
      const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, organizationId: 12.5 });

      expect(error.key).to.equal('organizationId');
      expect(error.why).to.equal('not_an_integer');
    });

    context('when birthdate is not a date', function () {
      it('throws an error', async function () {
        const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, birthdate: null });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });
    });

    context('when birthdate has not a valid format', function () {
      it('throws an error', async function () {
        const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, birthdate: '2020/02/01' });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('date_format');
      });
    });

    context('when birthdate is null', function () {
      it('throws an error', async function () {
        const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, birthdate: null });

        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });
    });

    context('when email is not correctly formed', function () {
      it('throws an error', async function () {
        const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, email: 'sdfsfsdf' });

        expect(error.key).to.equal('email');
        expect(error.why).to.equal('email_format');
      });
    });

    context('student number', function () {
      context('when student number is not correctly formed', function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        ['#123457', '1 23457', '1.23457', '1,23457E+11', 'gégé'].forEach((value) => {
          it(`throw an error when student number is ${value}`, async function () {
            const error = await catchErr(buildOrganizationLearner)({ ...validAttributes, studentNumber: value });

            expect(error.why).to.equal('student_number_format');
            expect(error.key).to.equal('studentNumber');
          });
        });
      });

      context('when student number is correctly formed', function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        ['123456', '1234aA', '1-a-B', '1_a_B'].forEach((value) => {
          it(`throw an error when student number is ${value}`, async function () {
            try {
              await buildOrganizationLearner({ ...validAttributes, studentNumber: value });
            } catch (e) {
              expect.fail('supOrganizationLearner is valid when student number is correctly formed');
            }
          });
        });
      });
    });
  });
});
