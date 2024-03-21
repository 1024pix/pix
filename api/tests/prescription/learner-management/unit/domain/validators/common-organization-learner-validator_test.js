import { validateCommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/validators/common-organization-learner-validator.js';
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
          fieldName: 'birthdate',
          type: 'date',
          format: 'YYYY-MM-DD',
          required: true,
        },
      ]);
      expect(errors).to.deep.equal([]);
    });
  });

  context('birthdate', function () {
    context('when birthdate is not conform', function () {
      it('throws an error', async function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: { birthdate: '123456' } }, [
          {
            fieldName: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors.length).to.equal(1);
        expect(errors[0].type).to.equal('date.format');
      });
    });

    context('when birthdate is not a date', function () {
      it('throws an error', async function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: { birthdate: '123456' } }, [
          {
            fieldName: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors.length).to.equal(1);
        expect(errors[0].type).to.equal('date.format');
      });
    });

    context('when birthdate has not a valid format', function () {
      it('throws an error', function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: { birthdate: '2020/03/19' } }, [
          {
            fieldName: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors.length).to.equal(1);
        expect(errors[0].type).to.equal('date.format');
      });
    });

    context('when birthdate does not exist ', function () {
      it('throws an error', function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: {} }, [
          {
            fieldName: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors.length).to.equal(1);
        expect(errors[0].type).to.equal('any.required');
      });
    });

    context('when birthdate presence is optional', function () {
      it('should not throw an error', function () {
        const errors = validateCommonOrganizationLearner({ ...learner, attributes: {} }, [
          {
            fieldName: 'birthdate',
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
