const { expect, sinon } = require('../../../test-helper');
const userValidator = require('../../../../lib/domain/validators/user-validator');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(errors, expectedError) {
  expect(errors).to.have.lengthOf(1);
  expect(errors[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | user-validator', function() {

  let sandbox;
  let userData;

  beforeEach(() => {
    userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.net',
      password: 'password1234',
      cgu: true,
    };

    sandbox = sinon.sandbox.create();
    sandbox.stub(userRepository, 'isEmailAvailable');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      it('should resolve (with no value) when validation is successful', () => {
        // given
        userRepository.isEmailAvailable.resolves();

        // when
        const promise = userValidator.validate(userData);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when user data validation fails', () => {

      context('all fields but email', () => {

        beforeEach(() => {
          userRepository.isEmailAvailable.resolves();
        });

        it('should reject with error on field "first name" when first name is missing', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/first-name' },
            title: 'Invalid user data attribute "firstName"',
            detail: 'Votre prénom n’est pas renseigné.',
            meta: {
              field: 'firstName'
            }
          };
          userData.firstName = MISSING_VALUE;

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with UserCreationValidationErrors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error on field "last name" when last name is missing', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/last-name' },
            title: 'Invalid user data attribute "lastName"',
            detail: 'Votre nom n’est pas renseigné.',
            meta: {
              field: 'lastName'
            }
          };
          userData.lastName = MISSING_VALUE;

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error on field "password" when password is missing', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/password' },
            title: 'Invalid user data attribute "password"',
            detail: 'Votre mot de passe n’est pas renseigné.',
            meta: {
              field: 'password'
            }
          };
          userData.password = MISSING_VALUE;

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error on field "password" when password is invalid', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/password' },
            title: 'Invalid user data attribute "password"',
            detail: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.',
            meta: {
              field: 'password'
            }
          };
          userData.password = 'invalid';

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error on field "cgu" when cgu is false', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/cgu' },
            title: 'Invalid user data attribute "cgu"',
            detail: 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
            meta: {
              field: 'cgu'
            }
          };
          userData.cgu = 'false';

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });
      });

      context('field "email"', () => {

        it('should reject with error on field "email" when email is missing', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/email' },
            title: 'Invalid user data attribute "email"',
            detail: 'Votre adresse électronique n’est pas renseignée.',
            meta: {
              field: 'email'
            }
          };
          userData.email = MISSING_VALUE;
          userRepository.isEmailAvailable.resolves();

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error on field "email" when email is invalid', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/email' },
            title: 'Invalid user data attribute "email"',
            detail: 'Votre adresse électronique n’est pas correcte.',
            meta: {
              field: 'email'
            }
          };
          userData.email = 'invalid_email';
          userRepository.isEmailAvailable.resolves();

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

        it('should reject with error on field "email" when email is already used by another user', () => {
          // given
          const expectedError = {
            source: { pointer: '/data/attributes/email' },
            title: 'Invalid user data attribute "email"',
            detail: 'L’adresse électronique est déjà utilisée.',
            meta: {
              field: 'email'
            }
          };
          userData.email = 'existing-email@example.net';
          userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());

          // when
          const promise = userValidator.validate(userData);

          // then
          return promise
            .then(() => expect.fail('Expected rejection with errors'))
            .catch((errors) => _assertErrorMatchesWithExpectedOne(errors, expectedError));
        });

      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        userData = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        };
        userRepository.isEmailAvailable.resolves();

        // when
        const promise = userValidator.validate(userData);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((errors) => {
            expect(errors).to.have.lengthOf(5);
          });
      });
    });
  });
});
