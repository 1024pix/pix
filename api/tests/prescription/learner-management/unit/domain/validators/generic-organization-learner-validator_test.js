import { validateGenericOrganizationLearner } from '../../../../../../src/prescription/learner-management/domain/validators/generic-organization-learner-validator.js';
import { ModelValidationError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Domain | Common Organization Learner Validator', function () {
  context('When learner is correct', function () {
    it('should return an empty array', function () {
      const errors = validateGenericOrganizationLearner({ prénom: 'Godzilla' }, [
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
        const errors = validateGenericOrganizationLearner({ prénom: 'Aldana' }, [
          {
            name: 'nom',
            type: 'string',
            required: true,
          },
        ]);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_REQUIRED');
        expect(errors[0].key).to.equal('nom');
      });

      it('when attributes is not required, not throws', async function () {
        const errors = validateGenericOrganizationLearner({}, [
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
        const errors = validateGenericOrganizationLearner({ nom: 'abcdefg' }, [
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
        const errors = validateGenericOrganizationLearner({ nom: 'A' }, [
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
        const errors = validateGenericOrganizationLearner({ nom: 'abcdefg' }, [
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
        const errors = validateGenericOrganizationLearner({ nom: 'A' }, [
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

    context('length', function () {
      it('when length matches, not throws', async function () {
        const errors = validateGenericOrganizationLearner({ nom: 'ABC' }, [
          {
            name: 'nom',
            type: 'string',
            length: 3,
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(0);
      });

      it('when length does not match, throws', async function () {
        const errors = validateGenericOrganizationLearner({ nom: 'AB' }, [
          {
            name: 'nom',
            type: 'string',
            length: 3,
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_STRING_LENGTH');
        expect(errors[0].key).to.equal('nom');
      });
    });

    context('regexp', function () {
      it('when value matches pattern, not throws', async function () {
        const errors = validateGenericOrganizationLearner({ nom: 'ABC123' }, [
          {
            name: 'nom',
            type: 'string',
            regexp: '/^[A-Z0-9]+$/',
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(0);
      });

      it('when value does not match pattern, throws', async function () {
        const errors = validateGenericOrganizationLearner({ nom: 'abc!' }, [
          {
            name: 'nom',
            type: 'string',
            regexp: '/^[A-Z0-9]+$/',
            required: false,
          },
        ]);

        expect(errors).to.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_STRING_PATTERN');
        expect(errors[0].key).to.equal('nom');
      });
    });

    context('When a specific value is required', function () {
      it('Should throw an error if the value do not corresponding to the expected value', async function () {
        const expectedValues = ['Theotime', 'Theo-a-pas-le-time'];
        const errors = validateGenericOrganizationLearner({ nom: 'abcdefg' }, [
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
        const errors = validateGenericOrganizationLearner({ nom: 'Theotime' }, [
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

  context('When attribute has a conditional rule', function () {
    it('when condition is met, applies then schema', async function () {
      const errors = validateGenericOrganizationLearner({ type: 'pro', nom: '' }, [
        {
          name: 'nom',
          type: 'string',
          conditional: {
            when: 'type',
            is: 'pro',
            then: { required: true },
            otherwise: { required: false },
          },
        },
      ]);

      expect(errors).to.lengthOf(1);
      expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
      expect(errors[0].code).to.equal('FIELD_REQUIRED');
      expect(errors[0].key).to.equal('nom');
    });

    it('when condition is not met, applies otherwise schema', async function () {
      const errors = validateGenericOrganizationLearner({ type: 'student', nom: '' }, [
        {
          name: 'nom',
          type: 'string',
          conditional: {
            when: 'type',
            is: 'pro',
            then: { required: true },
            otherwise: { required: false },
          },
        },
      ]);

      expect(errors).to.lengthOf(0);
    });
  });

  context('When attribute is a date', function () {
    context('when birthdate is not conform', function () {
      it('throws an error', async function () {
        const errors = validateGenericOrganizationLearner({ birthdate: '500-13-58' }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_DATE_FORMAT');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate is not a date', function () {
      it('throws an error', async function () {
        const errors = validateGenericOrganizationLearner({ birthdate: 'i`m not a date' }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);

        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_DATE_FORMAT');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate has not a valid format', function () {
      it('throws an error', function () {
        const errors = validateGenericOrganizationLearner({ birthdate: '2020/03/19' }, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
          },
        ]);

        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_DATE_FORMAT');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate does not exist ', function () {
      it('throws an error', function () {
        const errors = validateGenericOrganizationLearner({}, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: true,
          },
        ]);
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.be.an.instanceOf(ModelValidationError);
        expect(errors[0].code).to.equal('FIELD_REQUIRED');
        expect(errors[0].key).to.equal('birthdate');
      });
    });

    context('when birthdate presence is optional', function () {
      it('should not throw an error', function () {
        const errors = validateGenericOrganizationLearner({}, [
          {
            name: 'birthdate',
            type: 'date',
            format: 'YYYY-MM-DD',
            required: false,
          },
        ]);
        expect(errors).to.have.lengthOf(0);
      });
    });
  });
});
