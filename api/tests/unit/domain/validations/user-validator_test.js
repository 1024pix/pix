const { expect, catchErr } = require('../../../test-helper');
const userValidator = require('../../../../lib/domain/validators/user-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError) {
  expect(entityValidationErrors).to.be.instanceOf(EntityValidationError);
  expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(1);
  expect(entityValidationErrors.invalidAttributes[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | user-validator', function() {

  let user;

  describe('#validate', () => {

    context('when validation is for normal user', () => {

      beforeEach(() => {
        user = new User({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.net',
          password: 'Password1234',
          cgu: true,
        });
      });

      context('when validation is successful', () => {

        it('should resolve (with no value) when validation is successful', () => {
          // when
          const promise = userValidator.validate({ user });

          // then
          return expect(promise).to.be.fulfilled;
        });
      });

      context('when user data validation fails', () => {

        it('should reject with error when user is undefined', async () => {
          // given
          const expectedError = {
            attribute: undefined,
            message: 'Aucun champ n\'est renseigné.'
          };

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user: undefined });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "first name" when first name is missing', async () => {
          // given
          const expectedError = {
            attribute: 'firstName',
            message: 'Votre prénom n’est pas renseigné.'
          };
          user.firstName = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "last name" when last name is missing', async () => {
          // given
          const expectedError = {
            attribute: 'lastName',
            message: 'Votre nom n’est pas renseigné.'
          };
          user.lastName = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "password" when password is missing', async () => {
          // given
          const expectedError = {
            attribute: 'password',
            message: 'Votre mot de passe n’est pas renseigné.'
          };
          user.password = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "password" when password is invalid', async () => {
          // given
          const expectedError = {
            attribute: 'password',
            message: 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.'
          };
          user.password = 'invalid';

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "cgu" when cgu is false', async () => {
          // given
          const expectedError = {
            attribute: 'cgu',
            message: 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.'
          };
          user.cgu = 'false';

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "email" when email is missing', async () => {
          // given
          const expectedError = {
            attribute: 'email',
            message: 'Votre adresse e-mail n’est pas renseignée.'
          };
          user.email = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "email" when email is invalid', async () => {
          // given
          const expectedError = {
            attribute: 'email',
            message: 'Votre adresse e-mail n’est pas correcte.'
          };
          user.email = 'invalid_email';

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with errors on all fields (but only once by field) when all fields are missing', async () => {
          // given
          user = {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
          };

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user });

          // then
          expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(5);
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

        it('should resolve (with no value) when validation is successful', () => {
          // when
          const promise = userValidator.validate({ user, cguRequired });

          // then
          return expect(promise).to.be.fulfilled;
        });
      });

      context('when user data validation fails', () => {

        it('should reject with error when user is undefined', async () => {
          // given
          const expectedError = {
            attribute: undefined,
            message: 'Aucun champ n\'est renseigné.'
          };

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user: undefined, cguRequired });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "first name" when first name is missing', async () => {
          // given
          const expectedError = {
            attribute: 'firstName',
            message: 'Votre prénom n’est pas renseigné.'
          };
          user.firstName = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user, cguRequired });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "last name" when last name is missing', async () => {
          // given
          const expectedError = {
            attribute: 'lastName',
            message: 'Votre nom n’est pas renseigné.'
          };
          user.lastName = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user, cguRequired });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "password" when password is missing', async () => {
          // given
          const expectedError = {
            attribute: 'password',
            message: 'Votre mot de passe n’est pas renseigné.'
          };
          user.password = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user, cguRequired });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "password" when password is invalid', async () => {
          // given
          const expectedError = {
            attribute: 'password',
            message: 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.'
          };
          user.password = 'invalid';

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user, cguRequired });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with error on field "username" when username is missing', async () => {
          // given
          const expectedError = {
            attribute: 'username',
            message: 'Votre identifiant n’est pas renseigné.'
          };
          user.username = MISSING_VALUE;

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user, cguRequired });

          // then
          _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError);
        });

        it('should reject with errors on all fields (but only once by field) when all fields are missing', async () => {
          // given
          user = {
            firstName: '',
            lastName: '',
            username: '',
            password: '',
          };

          // when
          const entityValidationErrors = await catchErr(userValidator.validate)({ user, cguRequired });

          // then
          expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(4);
        });
      });
    });
  });
});
