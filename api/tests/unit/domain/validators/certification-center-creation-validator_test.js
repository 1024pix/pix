const { expect } = require('../../../test-helper');
const certificationCenterCreationValidator = require('../../../../lib/domain/validators/certification-center-creation-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | certification-center-validator', function () {
  describe('#validate', function () {
    context('when validation is successful', function () {
      it('should not throw any error', function () {
        // given
        const certificationCenterCreationParams = { name: 'ACME', type: 'PRO' };

        // when/then
        expect(certificationCenterCreationValidator.validate(certificationCenterCreationParams)).to.not.throw;
      });
    });

    context('when certification-center data validation fails', function () {
      context('on name attribute', function () {
        it('should reject with error when name is missing', function () {
          // given
          const expectedError = {
            attribute: 'name',
            message: 'Le nom n’est pas renseigné.',
          };
          const certificationCenterCreationParams = {
            name: MISSING_VALUE,
            type: 'PRO',
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error when name is longer than 255 characters', function () {
          // given
          const expectedError = {
            attribute: 'name',
            message: 'Le nom ne doit pas dépasser 255 caractères.',
          };
          const certificationCenterCreationParams = {
            name: 'a'.repeat(256),
            type: 'PRO',
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });
      });

      context('on type attribute', function () {
        it('should reject with error when type is missing', function () {
          // given
          const expectedError = [
            {
              attribute: 'type',
              message: 'Le type du centre de certification doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
            },
            {
              attribute: 'type',
              message: 'Le type n’est pas renseigné.',
            },
          ];

          const certificationCenterCreationParams = {
            name: 'ACME',
            type: MISSING_VALUE,
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            expect(errors.invalidAttributes).to.have.length(2);
            expect(errors.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });

        it('should reject with error when type value is not SUP, SCO or PRO', function () {
          // given
          const expectedError = {
            attribute: 'type',
            message: 'Le type du centre de certification doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
          };
          const certificationCenterCreationParams = { name: 'ACME', type: 'PTT' };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        // eslint-disable-next-line mocha/no-setup-in-describe
        ['SUP', 'SCO', 'PRO'].forEach((type) => {
          it(`should not throw with ${type} as type`, function () {
            // given
            const certificationCenterCreationParams = { name: 'ACME', type };

            // when/then
            return expect(certificationCenterCreationValidator.validate(certificationCenterCreationParams)).to.not
              .throw;
          });
        });
      });

      context('on externalId attribute', function () {
        it('should reject with error when externalId is longer than 255 characters', function () {
          // given
          const expectedError = [
            {
              attribute: 'externalId',
              message: 'L‘identifiant externe ne doit pas dépasser 255 caractères.',
            },
          ];

          const certificationCenterCreationParams = {
            name: 'ACME',
            type: 'SCO',
            externalId: 'a'.repeat(256),
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            expect(errors.invalidAttributes).to.have.length(1);
            expect(errors.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });
      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', function () {
        // given
        const certificationCenterCreationParams = {
          name: MISSING_VALUE,
          type: MISSING_VALUE,
        };

        try {
          // when
          certificationCenterCreationValidator.validate(certificationCenterCreationParams);
          expect.fail('should have thrown an error');
        } catch (errors) {
          // then
          expect(errors.invalidAttributes).to.have.lengthOf(3);
        }
      });
    });
  });
});
