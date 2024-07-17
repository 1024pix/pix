import { validateCommonOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/validators/common-organization-learner-validator.js';
import { ModelValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Common Organization Learner Validator', function () {
  context('When learner is correct', function () {
    it('should return an empty array', function () {
      const errors = validateCommonOrganizationLearner({ prénom: 'Godzilla' }, [
        {
          name: 'nom',
          type: 'string',
          required: false,
        },
      ]);
      expect(errors).to.deep.equal([]);
    });
  });

  context('When attribute is a string type', function () {
    context('required cases', function () {
      it('when missing attributes, throws an error', async function () {
        const errors = validateCommonOrganizationLearner({ prénom: 'Aldana' }, [
          {
            name: 'nom',
            type: 'string',
            required: true,
          },
        ]);
        expect(errors.length).to.equal(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_REQUIRED');
        expect(errors[0].key).to.equal('nom');
      });

      it('when attributes is not required, not throws', async function () {
        const errors = validateCommonOrganizationLearner({}, [
          {
            name: 'nom',
            type: 'string',
            required: false,
          },
        ]);
        expect(errors).to.lengthOf(0);
      });
    });

    context('min length', function () {
      it('when min length reach, not throws', async function () {
        const errors = validateCommonOrganizationLearner({ nom: 'abcdefg' }, [
          {
            name: 'nom',
            type: 'string',
            min: 2,
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(0);
      });

      it('when min length not reach, throws', async function () {
        const errors = validateCommonOrganizationLearner({ nom: 'A' }, [
          {
            name: 'nom',
            type: 'string',
            min: 2,
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_STRING_MIN');
        expect(errors[0].key).to.equal('nom');
      });
    });

    context('max length', function () {
      it('when min length reach, not throws', async function () {
        const errors = validateCommonOrganizationLearner({ nom: 'abcdefg' }, [
          {
            name: 'nom',
            type: 'string',
            max: 2,
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_STRING_MAX');
        expect(errors[0].key).to.equal('nom');
      });

      it('when min length not reach, throws', async function () {
        const errors = validateCommonOrganizationLearner({ nom: 'A' }, [
          {
            name: 'nom',
            type: 'string',
            max: 2,
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(0);
      });
    });

    context('When a specific value is required', function () {
      it('Should throw an error if the value do not corresponding to the expected value', async function () {
        const expectedValues = ['Theotime', 'Theo-a-pas-le-time'];
        const errors = validateCommonOrganizationLearner({ nom: 'abcdefg' }, [
          {
            name: 'nom',
            type: 'string',
            required: true,
            expectedValues,
          },
        ]);
        expect(errors).to.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_BAD_VALUES');
        expect(errors[0].key).to.equal('nom');
        expect(errors[0].valids).to.deep.equal(expectedValues);
      });
      it('Should not throw an error if the value corresponding to the expected value', async function () {
        const expectedValues = ['Theotime', 'Theo-a-pas-le-time'];
        const errors = validateCommonOrganizationLearner({ nom: 'Theotime' }, [
          {
            name: 'nom',
            type: 'string',
            required: true,
            expectedValues,
          },
        ]);
        expect(errors).to.lengthOf(0);
      });
    });
  });

  context('When attribute is a date', function () {
    context('when birthdate is not conform', function () {
      it('throws an error', async function () {
        const errors = validateCommonOrganizationLearner({ birthdate: '500-13-58' }, [
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
        const errors = validateCommonOrganizationLearner({ birthdate: 'i`m not a date' }, [
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
        const errors = validateCommonOrganizationLearner({ birthdate: '2020/03/19' }, [
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
        const errors = validateCommonOrganizationLearner({}, [
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
        const errors = validateCommonOrganizationLearner({}, [
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
