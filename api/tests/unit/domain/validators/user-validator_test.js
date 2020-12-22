/* eslint-disable mocha/no-identical-title */
const { expect, catchErr } = require('../../../test-helper');

const User = require('../../../../lib/domain/models/User');
const { EntityValidationError } = require('../../../../lib/domain/errors');

const userValidator = require('../../../../lib/domain/validators/user-validator');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | user-validator', () => {

  let user;

  describe('#validate', () => {

    context('when validation is for normal user', () => {

      beforeEach(() => {
        user = new User({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.net',
          cgu: true,
        });
      });

      context('when validation is successful', () => {

        it('should not throw any error', () => {
          expect(userValidator.validate({ user })).to.not.throw;
        });
      });

      context('when user data validation fails', () => {

        it('should reject with error when user is undefined', () => {
          // given
          const expectedError = {
            attribute: undefined,
            message: 'Aucun champ n\'est renseigné.',
          };

          // when
          try {
            userValidator.validate({ user: undefined });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "first name" when first name is missing', () => {
          // given
          const expectedError = {
            attribute: 'firstName',
            message: 'Votre prénom n’est pas renseigné.',
          };
          user.firstName = MISSING_VALUE;

          // when
          try {
            userValidator.validate({ user });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "last name" when last name is missing', () => {
          // given
          const expectedError = {
            attribute: 'lastName',
            message: 'Votre nom n’est pas renseigné.',
          };
          user.lastName = MISSING_VALUE;

          // when
          try {
            userValidator.validate({ user });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "cgu" when cgu is false', () => {
          // given
          const expectedError = {
            attribute: 'cgu',
            message: 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
          };
          user.cgu = 'false';

          // when
          try {
            userValidator.validate({ user });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "email" when email is missing', () => {
          // given
          const expectedError = {
            attribute: 'email',
            message: 'Votre adresse e-mail n’est pas renseignée.',
          };
          user.email = MISSING_VALUE;

          // when
          try {
            userValidator.validate({ user });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "email" when email is invalid', () => {
          // given
          const expectedError = {
            attribute: 'email',
            message: 'Le format de l\'adresse e-mail est incorrect.',
          };
          user.email = 'invalid_email';

          // when
          try {
            userValidator.validate({ user });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error when neither email nor username are defined', async () => {
          // given
          const expectedError = {
            attribute: undefined,
            message: 'Vous devez renseigner une adresse e-mail et/ou un identifiant.',
          };

          user.email = undefined;
          user.username = undefined;

          // when
          const errors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(errors, expectedError);
        });

        it('should reject with errors on all fields (but only once by field) when all fields are missing', async () => {
          // given
          user = {
            firstName: '',
            lastName: '',
            email: '',
          };

          // when
          const error = await catchErr(userValidator.validate)({ user });

          // then
          expect(error.invalidAttributes).to.have.lengthOf(4);
        });

        it('should reject with errors on firstName, lastName and email when firstName, lastName and email have a maximum length of 255', async () => {
          // given
          const expectedFirstNameError = {
            attribute: 'firstName',
            message: 'Votre prénom ne doit pas dépasser les 255 caractères.',
          };
          const expectedLastNameError = {
            attribute: 'lastName',
            message: 'Votre nom ne doit pas dépasser les 255 caractères.',
          };
          const expectedMaxLengthEmailError = {
            attribute: 'email',
            message: 'Votre adresse e-mail ne doit pas dépasser les 255 caractères.',
          };

          user = {
            firstName: 'John'.repeat(70),
            lastName: 'Doe'.repeat(90),
            email: 'john.doe'.repeat(32) + '@example.net',
            cgu: true,
          };

          // when
          const errors = await catchErr(userValidator.validate)({ user });

          // then
          expect(errors.invalidAttributes).to.have.lengthOf(3);
          expect(errors).to.be.instanceOf(EntityValidationError);
          expect(errors.invalidAttributes[0]).to.deep.equal(expectedFirstNameError);
          expect(errors.invalidAttributes[1]).to.deep.equal(expectedLastNameError);
          expect(errors.invalidAttributes[2]).to.deep.equal(expectedMaxLengthEmailError);
        });

        it('should reject with error on field "mustValidateTermsOfService" when incorrect', async() => {
          // given
          const expectedError = {
            attribute: 'mustValidateTermsOfService',
            message: '"mustValidateTermsOfService" must be a boolean',
          };
          user.mustValidateTermsOfService = 'not_a_boolean';

          // when
          const errors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(errors, expectedError);
        });

        it('should reject with error on field "hasSeenAssessmentInstructions" when incorrect', async() => {
          // given
          const expectedError = {
            attribute: 'hasSeenAssessmentInstructions',
            message: '"hasSeenAssessmentInstructions" must be a boolean',
          };

          user.hasSeenAssessmentInstructions = 1;

          // when
          const errors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(errors, expectedError);
        });
      });
    });

    context('when validation is for student dependent user', () => {

      const cguRequired = false;

      beforeEach(() => {
        user = new User({
          firstName: 'John',
          lastName: 'Doe',
          username: 'john.doe1212',
          password: 'Password1234',
        });
      });

      context('when validation is successful', () => {

        it('should not throw any error', () => {
          expect(userValidator.validate({ user, cguRequired })).to.not.throw;
        });
      });

      context('when user data validation fails', () => {

        it('should reject with error when user is undefined', () => {
          // given
          const expectedError = {
            attribute: undefined,
            message: 'Aucun champ n\'est renseigné.',
          };

          // when
          try {
            userValidator.validate({ user: undefined, cguRequired });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "first name" when first name is missing', () => {
          // given
          const expectedError = {
            attribute: 'firstName',
            message: 'Votre prénom n’est pas renseigné.',
          };
          user.firstName = MISSING_VALUE;

          // when
          try {
            userValidator.validate({ user, cguRequired });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "last name" when last name is missing', () => {
          // given
          const expectedError = {
            attribute: 'lastName',
            message: 'Votre nom n’est pas renseigné.',
          };
          user.lastName = MISSING_VALUE;

          // when
          try {
            userValidator.validate({ user, cguRequired });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with error on field "username" when username is missing', () => {
          // given
          const expectedError = {
            attribute: 'username',
            message: 'Votre identifiant n’est pas renseigné.',
          };
          user.username = MISSING_VALUE;

          // when
          try {
            userValidator.validate({ user, cguRequired });
            expect.fail('should have thrown an error');
          } catch (errors) {
            // then
            _assertErrorMatchesWithExpectedOne(errors, expectedError);
          }
        });

        it('should reject with errors on all fields (but only once by field) when all fields are missing', async () => {
          // given
          user = {
            firstName: '',
            lastName: '',
            username: '',
          };

          // when
          const error = await catchErr(userValidator.validate)({ user, cguRequired });

          // then
          expect(error.invalidAttributes).to.have.lengthOf(3);
        });
      });
    });
  });
});
