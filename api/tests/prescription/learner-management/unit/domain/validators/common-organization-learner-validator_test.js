import { validateCommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/validators/common-organization-learner-validator.js';
import { ModelValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Common Organization Learner Validator', function () {
  const learner = {
    firstName: 'Richard',
    lastName: 'Aldana',
    organizationId: 123,
    attributes: {
      birthdate: '2020-02-01',
    },
  };

  context('When learner is correct', function () {
    it('should return an empty array', function () {
      const errors = validateCommonOrganizationLearner(learner, [
        {
          name: 'birthdate',
          type: 'date',
          format: 'YYYY-MM-DD',
          required: true,
        },
      ]);
      expect(errors).to.deep.equal([]);
    });
  });

  context('required attributes', function () {
    context('firstName', function () {
      it('when missing firstName, throws an error', async function () {
        const errors = validateCommonOrganizationLearner(
          { lastName: 'Aldana', organizationId: 123, attributes: {} },
          [],
        );
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_REQUIRED');
        expect(errors[0].key).to.equal('firstName');
      });

      it('when firstName is not a string, throws an error', async function () {
        const errors = validateCommonOrganizationLearner({
          lastName: 'Aldana',
          organizationId: 123,
          firstName: null,
          attributes: {},
        });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_NOT_STRING');
        expect(errors[0].key).to.equal('firstName');
      });
    });

    it('when missing lastName throws an error', async function () {
      const errors = validateCommonOrganizationLearner({
        organizationId: 123,
        firstName: 'Zoé',
        attributes: {},
      });
      expect(errors.length).to.equal(1);
      expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
      expect(errors[0].code).to.equal('FIELD_REQUIRED');
      expect(errors[0].key).to.equal('lastName');
    });

    context('organizationId', function () {
      it('when missing organizationId throws an error', async function () {
        const errors = validateCommonOrganizationLearner({
          lastName: 'Aldana',
          firstName: 'Zoé',
          attributes: {},
        });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_REQUIRED');
        expect(errors[0].key).to.equal('organizationId');
      });
      it('when organizationId is not an integer throws an error', async function () {
        const errors = validateCommonOrganizationLearner({
          lastName: 'Aldana',
          organizationId: 'truc',
          firstName: 'Zoé',
          attributes: {},
        });
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_NOT_NUMBER');
        expect(errors[0].key).to.equal('organizationId');
      });
    });
  });
  context('birthdate', function () {
    context('when birthdate is not conform', function () {
      it('throws an error', async function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: { birthdate: '123456' } }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_DATE_FORMAT');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate is not a date', function () {
      it('throws an error', async function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: { birthdate: '123456' } }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);

        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_DATE_FORMAT');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate has not a valid format', function () {
      it('throws an error', function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: { birthdate: '2020/03/19' } }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
          },
        ]);

        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_DATE_FORMAT');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate does not exist ', function () {
      it('throws an error', function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: {} }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_REQUIRED');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate presence is optional', function () {
      it('should not throw an error', function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: {} }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: false,
          },
        ]);
        expect(errors.length).to.equal(0);
      });
    });
  });
});
