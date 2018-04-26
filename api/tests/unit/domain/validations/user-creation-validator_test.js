const Joi = require('joi');
const { expect, sinon } = require('../../../test-helper');
const userCreationValidator = require('../../../../lib/domain/validators/user-creation-validator');
const googleReCaptcha = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const { UserValidationErrors } = require('../../../../lib/domain/errors');
const { InvalidRecaptchaTokenError } = require('../../../../lib/infrastructure/validators/errors');

const MISSING_VALUE = '';

function _assertErrorMatchesWithExpectedOne(err, expectedError) {
  expect(err).to.be.an.instanceof(UserValidationErrors);
  expect(err.errors).to.have.lengthOf(1);
  expect(err.errors[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | user-creation-validator', function() {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(googleReCaptcha, 'verify');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      beforeEach(() => {
        googleReCaptcha.verify.resolves();
        sandbox.stub(Joi, 'validate').resolves();
      });

      it('should resolve (with no value) when validation is successful', () => {
        // given
        const recaptchaToken = 'recaptcha_token';
        const userData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.net',
          password: 'password1234',
          cgu: true,
        };

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when reCAPTCHA validation fails', () => {

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.net',
        password: 'password1234',
        cgu: true,
      };

      beforeEach(() => {
        sandbox.stub(Joi, 'validate').resolves();
      });

      it('should resolve when reCAPTCHA validation is true', () => {
        // given
        googleReCaptcha.verify.resolves();

        // when
        const promise = userCreationValidator.validate(userData, 'invalid_recaptcha_token');

        // then
        return expect(promise).to.be.fulfilled;
      });

      it('should reject with well formatted error when an error occurs during reCAPTCHA validation', () => {
        // given
        const someNetworkError = new Error('Some error calling Google reCAPTCHA service');
        googleReCaptcha.verify.rejects(someNetworkError);

        // when
        const promise = userCreationValidator.validate(userData, 'recaptcha_token');

        // then
        return promise
          .then(() => expect.fail('Expected rejection with some Error'))
          .catch((error) => {
            expect(error).to.equal(someNetworkError);
          });
      });

      it('should reject with well formatted error when reCAPTCHA validation is false', () => {
        // given
        const expectedError = {
          source: '/data/attributes/recaptcha-token',
          title: 'Invalid reCAPTCHA token',
          details: 'Merci de cocher la case ci-dessous :',
          meta: {
            field: 'recaptchaToken'
          }
        };
        googleReCaptcha.verify.rejects(new InvalidRecaptchaTokenError());

        // when
        const promise = userCreationValidator.validate(userData, 'invalid_recaptcha_token');

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });
    });

    context('when user data validation fails', () => {

      let userData;
      let recaptchaToken;

      beforeEach(() => {
        recaptchaToken = 'recaptcha_token';
        userData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.net',
          password: 'à1      ',
          cgu: true,
        };
        googleReCaptcha.verify.resolves();
      });

      it('should reject with error on field "first name" when first name is missing', () => {
        // given
        const expectedError = {
          source: '/data/attributes/first-name',
          title: 'Invalid user data attribute "firstName"',
          details: 'Votre prénom n’est pas renseigné.',
          meta: {
            field: 'firstName'
          }
        };
        userData.firstName = MISSING_VALUE;

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with error on field "last name" when last name is missing', () => {
        // given
        const expectedError = {
          source: '/data/attributes/last-name',
          title: 'Invalid user data attribute "lastName"',
          details: 'Votre nom n’est pas renseigné.',
          meta: {
            field: 'lastName'
          }
        };
        userData.lastName = MISSING_VALUE;

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with error on field "email" when email is missing', () => {
        // given
        const expectedError = {
          source: '/data/attributes/email',
          title: 'Invalid user data attribute "email"',
          details: 'Votre adresse électronique n’est pas renseignée.',
          meta: {
            field: 'email'
          }
        };
        userData.email = MISSING_VALUE;

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with error on field "email" when email is invalid', () => {
        // given
        const expectedError = {
          source: '/data/attributes/email',
          title: 'Invalid user data attribute "email"',
          details: 'Votre adresse électronique n’est pas correcte.',
          meta: {
            field: 'email'
          }
        };
        userData.email = 'invalid_email';

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with error on field "password" when password is missing', () => {
        // given
        const expectedError = {
          source: '/data/attributes/password',
          title: 'Invalid user data attribute "password"',
          details: 'Votre mot de passe n’est pas renseigné.',
          meta: {
            field: 'password'
          }
        };
        userData.password = MISSING_VALUE;

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with error on field "password" when password is invalid', () => {
        // given
        const expectedError = {
          source: '/data/attributes/password',
          title: 'Invalid user data attribute "password"',
          details: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.',
          meta: {
            field: 'password'
          }
        };
        userData.password = 'invalid';

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with error on field "cgu" when cgu is false', () => {
        // given
        const expectedError = {
          source: '/data/attributes/cgu',
          title: 'Invalid user data attribute "cgu"',
          details: 'Vous devez accepter les conditions d’utilisation de Pix pour créer un compte.',
          meta: {
            field: 'cgu'
          }
        };
        userData.cgu = 'false';

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with errors on all fields (but only once by field) when all fields are missing', () => {
        // given
        userData = {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        };

        // when
        const promise = userCreationValidator.validate(userData, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserValidationErrors'))
          .catch((err) => {
            expect(err).to.be.an.instanceof(UserValidationErrors);
            expect(err.errors).to.have.lengthOf(5);
          });
      });
    });
  });
});
