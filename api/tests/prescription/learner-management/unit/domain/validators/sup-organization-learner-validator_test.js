import { validateSupOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/validators/sup-organization-learner-validator.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Sup Organization Learner Validator', function () {
  const learner = {
    studentNumber: 'LASTMAN',
    firstName: 'Richard',
    lastName: 'Aldana',
    birthdate: '2020-02-01',
    organizationId: 123,
  };
  context('When learner is correct', function () {
    it('should return an empty array', function () {
      const errors = validateSupOrganizationLearner(learner);
      expect(errors).to.deep.equal([]);
    });
  });
  context('when a required field is missing', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    ['studentNumber', 'firstName', 'lastName', 'birthdate', 'organizationId'].forEach((field) => {
      it(`returns an EntityValidationError error if ${field} is missing`, function () {
        const errors = validateSupOrganizationLearner({ ...learner, [field]: undefined });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceof(EntityValidationError);
        expect(errors[0].key).to.equal(field);
        expect(errors[0].why).to.equal('required');
      });
    });
  });
  context('fields with a a max length of 255 characters', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      'studentNumber',
      'firstName',
      'middleName',
      'thirdName',
      'lastName',
      'preferredLastName',
      'diploma',
      'department',
      'educationalTeam',
      'group',
      'studyScheme',
    ].forEach((field) => {
      it(`throw an error when ${field} has more than 255 characters`, async function () {
        const errors = validateSupOrganizationLearner({ ...learner, [field]: '1'.repeat(256) });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceof(EntityValidationError);
        expect(errors[0].key).to.equal(field);
        expect(errors[0].why).to.equal('max_length');
      });
    });
    it(`throw an error when email has more than 255 characters`, async function () {
      const errors = validateSupOrganizationLearner({ ...learner, email: `${'1'.repeat(256)}@email.com` });
      expect(errors.length).to.equal(1);
      expect(errors[0]).to.be.an.instanceof(EntityValidationError);
      expect(errors[0].key).to.equal('email');
      expect(errors[0].why).to.equal('email_format');
    });
  });

  context('birthdate', function () {
    context('when birthdate is not a date', function () {
      it('throws an error', async function () {
        const errors = await validateSupOrganizationLearner({ ...learner, birthdate: '123456' });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceof(EntityValidationError);
        expect(errors[0].key).to.equal('birthdate');
        expect(errors[0].why).to.equal('date_format');
      });
    });

    context('when birthdate has not a valid format', function () {
      it('throws an error', function () {
        const errors = validateSupOrganizationLearner({ ...learner, birthdate: '2020/01/01' });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceof(EntityValidationError);
        expect(errors[0].key).to.equal('birthdate');
        expect(errors[0].why).to.equal('date_format');
      });
    });

    context('when birthdate is null', function () {
      it('throws an error', function () {
        const errors = validateSupOrganizationLearner({ ...learner, birthdate: null });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceof(EntityValidationError);
        expect(errors[0].key).to.equal('birthdate');
        expect(errors[0].why).to.equal('required');
      });
    });
  });
  context('multiple error on the same line', function () {
    it('throw an error with all bad element in the line', function () {
      const errors = validateSupOrganizationLearner({ ...learner, email: 'email', studentNumber: 'é&"' });
      expect(errors.length).to.equal(2);
      expect(errors[0]).to.be.an.instanceof(EntityValidationError);
      expect(errors[0].key).to.equal('studentNumber');
      expect(errors[0].why).to.equal('student_number_format');
      expect(errors[1]).to.be.an.instanceof(EntityValidationError);
      expect(errors[1].key).to.equal('email');
      expect(errors[1].why).to.equal('email_format');
    });
  });
});
