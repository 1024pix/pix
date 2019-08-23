const { expect } = require('../../../test-helper');
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

  beforeEach(() => {
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.net',
      password: 'Password1234',
      cgu: true,
    });
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should resolve (with no value) when validation is successful', () => {
        // when
        const promise = userValidator.validate(user);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when user data validation fails', () => {

      it('should reject with error on field "first name" when first name is missing', () => {
        // given
        const expectedError = {
          attribute: 'firstName',
          message: 'Votre prénom n’est pas renseigné.'
        };
        user.firstName = MISSING_VALUE;

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
      });

      it('should reject with error on field "last name" when last name is missing', () => {
        // given
        const expectedError = {
          attribute: 'lastName' ,
          message: 'Votre nom n’est pas renseigné.'
        };
        user.lastName = MISSING_VALUE;

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
      });

      it('should reject with error on field "password" when password is missing', () => {
        // given
        const expectedError = {
          attribute: 'password',
          message: 'Votre mot de passe n’est pas renseigné.'
        };
        user.password = MISSING_VALUE;

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
      });

      it('should reject with error on field "password" when password is invalid', () => {
        // given
        const expectedError = {
          attribute: 'password',
          message: 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.'
        };
        user.password = 'invalid';

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
      });

      it('should reject with error on field "cgu" when cgu is false', () => {
        // given
        const expectedError = {
          attribute: 'cgu',
          message: 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.'
        };
        user.cgu = 'false';

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
      });

      it('should reject with error on field "email" when email is missing', () => {
        // given
        const expectedError = {
          attribute: 'email',
          message: 'Votre adresse électronique n’est pas renseignée.'
        };
        user.email = MISSING_VALUE;

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
      });

      it('should reject with error on field "email" when email is invalid', () => {
        // given
        const expectedError = {
          attribute: 'email',
          message: 'Votre adresse électronique n’est pas correcte.'
        };
        user.email = 'invalid_email';

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => _assertErrorMatchesWithExpectedOne(entityValidationErrors, expectedError));
      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        user = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        };

        // when
        const promise = userValidator.validate(user);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((entityValidationErrors) => {
            expect(entityValidationErrors.invalidAttributes).to.have.lengthOf(5);
          });
      });
    });
  });
});
