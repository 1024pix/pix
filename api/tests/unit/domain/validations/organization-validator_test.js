const { expect } = require('../../../test-helper');
const organizationValidator = require('../../../../lib/domain/validators/organization-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const Organization = require('../../../../lib/domain/models/Organization');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | organization-validator', function() {

  let organization;

  beforeEach(() => {
    organization = new Organization({
      name: 'Lycée des Rosiers',
      type: 'SUP',
      email: 'lycee.des.rosiers@example.net'
    });
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should resolve (with no value) when validation is successful', () => {
        // when
        const promise = organizationValidator.validate(organization);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when organization data validation fails', () => {

      context('on name attribute', () => {

        it('should reject with error when name is missing', () => {
          // given
          const expectedError = {
            attribute: 'name',
            message: 'Le nom n’est pas renseigné.'
          };
          organization.name = MISSING_VALUE;

          // when
          const promise = organizationValidator.validate(organization);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

      });

      context('on email attribute', () => {

        it('should reject with error when email is missing', () => {
          // given
          const expectedError = {
            attribute: 'email',
            message: 'L’adresse électronique n’est pas renseignée.'
          };
          organization.email = MISSING_VALUE;

          // when
          const promise = organizationValidator.validate(organization);

          // then
          return promise
            .then(() => expect.fail('Expected rejection erros'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error when email is invalid', () => {
          // given
          const expectedError = {
            attribute: 'email',
            message: 'L’adresse électronique n’est pas correcte.'
          };
          organization.email = 'invalid_email';

          // when
          const promise = organizationValidator.validate(organization);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

      });

      context('on type attribute', () => {

        it('should reject with error when type is missing', () => {
          // given
          const expectedError = {
            attribute: 'type',
            message: 'Le type n’est pas renseigné.'
          };
          organization.type = MISSING_VALUE;

          // when
          const promise = organizationValidator.validate(organization);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error when type value is not SUP, SCO or PRO', () => {
          // given
          const expectedError = {
            attribute: 'type',
            message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.'
          };
          organization.type = 'PTT';

          // when
          const promise = organizationValidator.validate(organization);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        [
          'SUP',
          'SCO',
          'PRO'
        ].forEach((type) => {
          it(`should accept ${type} as type`, function() {
            // given
            organization.type = type;

            // when
            const promise = organizationValidator.validate(organization);

            // then
            return expect(promise).to.be.fulfilled;
          });
        });

      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        organization = {
          name: '',
          email: '',
          type: '',
        };

        // when
        const promise = organizationValidator.validate(organization);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => {
            expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(3);
          });
      });
    });
  });
});
