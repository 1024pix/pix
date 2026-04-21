import * as organizationCreationValidator from '../../../../../src/organizational-entities/domain/validators/organization-creation-validator.js';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';

import { catchErr } from '../../../../tooling/test-utils/error.js';

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | organization-validator', function () {
  describe('#validate', function () {
    context('when validation is successful', function () {
      it('should not throw any error', function () {
        // given
        const organizationCreationParams = {
          name: 'ACME',
          type: 'PRO',
          documentationUrl: 'https://kingArthur.com',
          administrationTeamId: 1234,
          countryCode: 99123,
          organizationLearnerType: { id: 1 },
        };

        // when/then
        expect(() => organizationCreationValidator.validate(organizationCreationParams)).to.not.throw();
      });
    });

    context('when organization data validation fails', function () {
      context('on name attribute', function () {
        it('should reject with error when name is missing', function () {
          // given
          const expectedError = {
            attribute: 'name',
            message: 'Le nom n’est pas renseigné.',
          };
          const organizationCreationParams = {
            name: MISSING_VALUE,
            type: 'PRO',
            administrationTeamId: 1234,
            countryCode: 99123,
            organizationLearnerType: { id: 1 },
          };

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

      context('on type attribute', function () {
        it('should reject with error when type is missing', function () {
          // given
          const expectedError = [
            {
              attribute: 'type',
              message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
            },
            {
              attribute: 'type',
              message: 'Le type n’est pas renseigné.',
            },
          ];

          const organizationCreationParams = {
            name: 'ACME',
            type: MISSING_VALUE,
            administrationTeamId: 1234,
            countryCode: 99123,
            organizationLearnerType: { id: 1 },
          };

          try {
            // when
            organizationCreationValidator.validate(organizationCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            expect(errors.invalidAttributes).to.have.lengthOf(2);
            expect(errors.invalidAttributes).to.have.deep.equal(expectedError);
          }
        });

        it('should reject with error when type value is not SUP, SCO or PRO', function () {
          // given
          const expectedError = {
            attribute: 'type',
            message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
          };
          const organizationCreationParams = {
            name: 'ACME',
            type: 'PTT',
            administrationTeamId: 1234,
            countryCode: 99123,
            organizationLearnerType: { id: 1 },
          };

          try {
            // when
            organizationCreationValidator.validate(organizationCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        ['SUP', 'SCO', 'PRO', 'SCO-1D'].forEach((type) => {
          it(`should not throw with ${type} as type`, function () {
            // given
            const organizationCreationParams = {
              name: 'ACME',
              type,
              administrationTeamId: 1234,
              countryCode: 99123,
              organizationLearnerType: { id: 1 },
            };

            // when/then
            return expect(() => organizationCreationValidator.validate(organizationCreationParams)).to.not.throw();
          });
        });
      });

      context('on documentationUrl attribute', function () {
        it('should reject with error when documentationUrl is invalide', async function () {
          // given
          const organizationCreationParams = {
            name: 'ACME',
            type: 'PRO',
            documentationUrl: 'invalidUrl',
            administrationTeamId: 1234,
            countryCode: 99123,
            organizationLearnerType: { id: 1 },
          };
          const error = await catchErr(organizationCreationValidator.validate)(organizationCreationParams);

          // then
          expect(error.invalidAttributes[0].attribute).to.equal('documentationUrl');
          expect(error.invalidAttributes[0].message).to.equal('Le lien vers la documentation n’est pas valide.');
        });
      });

      context('on administrationTeamId attribute', function () {
        it('should reject with error when administrationTeamId is missing', function () {
          // given
          const expectedError = {
            attribute: 'administrationTeamId',
            message: 'L’équipe en charge n’est pas renseignée.',
          };
          const organizationCreationParams = {
            name: 'ACME',
            type: 'PRO',
            countryCode: 99123,
            administrationTeamId: undefined,
            organizationLearnerType: { id: 1 },
          };

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

      context('on countryCode attribute', function () {
        it('should reject with error when countryCode is missing', function () {
          // given
          const expectedError = {
            attribute: 'countryCode',
            message: 'Le code pays n’est pas renseigné.',
          };
          const organizationCreationParams = {
            name: 'ACME',
            type: 'PRO',
            administrationTeamId: 1234,
            countryCode: undefined,
            organizationLearnerType: { id: 1 },
          };

          try {
            // when
            organizationCreationValidator.validate(organizationCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error when countryCode is below minimum', function () {
          // given
          const expectedError = {
            attribute: 'countryCode',
            message: 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
          };
          const organizationCreationParams = {
            name: 'ACME',
            type: 'PRO',
            administrationTeamId: 1234,
            countryCode: 98999,
            organizationLearnerType: { id: 1 },
          };

          try {
            // when
            organizationCreationValidator.validate(organizationCreationParams);
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error when countryCode is above maximum', function () {
          // given
          const expectedError = {
            attribute: 'countryCode',
            message: 'Le code pays doit être un nombre entier compris entre 99000 et 99999.',
          };
          const organizationCreationParams = {
            name: 'ACME',
            type: 'PRO',
            administrationTeamId: 1234,
            countryCode: 100000,
            organizationLearnerType: { id: 1 },
          };

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

      context('on organizationLearnerType attribute', function () {
        it('should reject with error when organizationLearnerType is missing', function () {
          // given
          const expectedError = {
            attribute: 'organizationLearnerType',
            message: "Le public prescrit n'est pas renseigné.",
          };
          const organizationCreationParams = {
            name: 'ACME',
            type: 'PRO',
            administrationTeamId: 1234,
            countryCode: 99998,
          };

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

      it('should reject with errors on all fields (but only once by field) when all fields are missing', function () {
        // given
        const organizationCreationParams = {
          name: MISSING_VALUE,
          type: MISSING_VALUE,
          administrationTeamId: MISSING_VALUE,
          countryCode: MISSING_VALUE,
          organizationLearnerType: { id: 1 },
        };

        try {
          // when
          organizationCreationValidator.validate(organizationCreationParams);
          expect.fail('should have thrown an error');
        } catch (errors) {
          // then
          expect(errors.invalidAttributes).to.have.lengthOf(5);
        }
      });
    });
  });
});
