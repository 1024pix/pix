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
        const certificationCenterCreationParams = { name: 'ACME', type: 'PRO', isSupervisorAccessEnabled: false };

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
            isSupervisorAccessEnabled: false,
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (error) {
            // then
            _assertErrorMatchesWithExpectedOne(error, expectedError);
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
            isSupervisorAccessEnabled: false,
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (error) {
            // then
            _assertErrorMatchesWithExpectedOne(error, expectedError);
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
            isSupervisorAccessEnabled: false,
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (error) {
            // then
            expect(error.invalidAttributes).to.have.length(2);
            expect(error.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });

        it('should reject with error when type value is not SUP, SCO or PRO', function () {
          // given
          const expectedError = {
            attribute: 'type',
            message: 'Le type du centre de certification doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
          };
          const certificationCenterCreationParams = { name: 'ACME', type: 'PTT', isSupervisorAccessEnabled: false };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (error) {
            // then
            _assertErrorMatchesWithExpectedOne(error, expectedError);
          }
        });

        // eslint-disable-next-line mocha/no-setup-in-describe
        ['SUP', 'SCO', 'PRO'].forEach((type) => {
          it(`should not throw with ${type} as type`, function () {
            // given
            const certificationCenterCreationParams = { name: 'ACME', type, isSupervisorAccessEnabled: false };

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
            isSupervisorAccessEnabled: false,
            externalId: 'a'.repeat(256),
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (error) {
            // then
            expect(error.invalidAttributes).to.have.length(1);
            expect(error.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });
      });

      context('on isSupervisorAccessEnabled attribute', function () {
        it('should reject with error when isSupervisorAccessEnabled is not a boolean', function () {
          // given
          const expectedError = [
            {
              attribute: 'isSupervisorAccessEnabled',
              message: 'L‘accès à l‘espace surveillant n’est pas renseigné.',
            },
          ];

          const certificationCenterCreationParams = {
            name: 'ACME',
            type: 'SCO',
            isSupervisorAccessEnabled: 'NOT A BOOLEAN',
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (error) {
            // then
            expect(error.invalidAttributes).to.have.length(1);
            expect(error.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });

        it('should reject with error when isSupervisorAccessEnabled is missing', function () {
          // given
          const expectedError = [
            {
              attribute: 'isSupervisorAccessEnabled',
              message: 'L‘accès à l‘espace surveillant n’est pas renseigné.',
            },
          ];

          const certificationCenterCreationParams = {
            name: 'ACME',
            type: 'SCO',
            isSupervisorAccessEnabled: MISSING_VALUE,
          };

          try {
            // when
            certificationCenterCreationValidator.validate(certificationCenterCreationParams);
            expect.fail('should have thrown an error');
          } catch (error) {
            // then
            expect(error.invalidAttributes).to.have.length(1);
            expect(error.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });
      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', function () {
        // given
        const certificationCenterCreationParams = {
          name: MISSING_VALUE,
          type: MISSING_VALUE,
          isSupervisorAccessEnabled: MISSING_VALUE,
        };

        try {
          // when
          certificationCenterCreationValidator.validate(certificationCenterCreationParams);
          expect.fail('should have thrown an error');
        } catch (error) {
          // then
          expect(error.invalidAttributes).to.have.lengthOf(4);
        }
      });
    });
  });
});
