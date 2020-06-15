const { expect } = require('../../../test-helper');
const organizationCreationValidator = require('../../../../lib/domain/validators/organization-creation-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | organization-validator', function() {

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should not throw any error', () => {
        // given
        const organizationCreationParams = { name: 'ACME', type: 'PRO' };

        // when/then
        expect(organizationCreationValidator.validate(organizationCreationParams)).to.not.throw;
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
          const organizationCreationParams = { name: MISSING_VALUE, type: 'PRO' };

          try {
            // when
            organizationCreationValidator.validate(organizationCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

      });

      context('on type attribute', () => {

        it('should reject with error when type is missing', () => {
          // given
          const expectedError = [
            {
              attribute: 'type',
              message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.'
            },
            {
              attribute: 'type',
              message: 'Le type n’est pas renseigné.'
            }];

          const organizationCreationParams = { name: 'ACME', type: MISSING_VALUE };

          try {
            // when
            organizationCreationValidator.validate(organizationCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            expect(errors.invalidAttributes).to.have.length(2);
            expect(errors.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });

        it('should reject with error when type value is not SUP, SCO or PRO', () => {
          // given
          const expectedError = {
            attribute: 'type',
            message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.'
          };
          const organizationCreationParams = { name: 'ACME', type: 'PTT' };

          try {
            // when
            organizationCreationValidator.validate(organizationCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        [
          'SUP',
          'SCO',
          'PRO'
        ].forEach((type) => {
          it(`should not throw with ${type} as type`, function() {
            // given
            const organizationCreationParams = { name: 'ACME', type };

            // when/then
            return expect(organizationCreationValidator.validate(organizationCreationParams)).to.not.throw;
          });
        });

      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        const organizationCreationParams = { name: MISSING_VALUE, type: MISSING_VALUE, };

        try {
          // when
          organizationCreationValidator.validate(organizationCreationParams);
          expect.fail('should have thrown an error');
        } catch (errors) {
          // then
          expect(errors.invalidAttributes).to.have.lengthOf(3);
        }
      });
    });
  });
});
