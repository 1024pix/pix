const { expect, sinon } = require('../../../test-helper');
const userCreationValidator = require('../../../../lib/domain/validators/user-creation-validator');
const userValidator = require('../../../../lib/domain/validators/user-validator');
const googleReCaptcha = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../../lib/domain/models/User');
const { UserCreationValidationErrors } = require('../../../../lib/domain/errors');
const { InvalidRecaptchaTokenError } = require('../../../../lib/infrastructure/validators/errors');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');

function _assertErrorMatchesWithExpectedOne(err, expectedError) {
  expect(err).to.be.an.instanceof(UserCreationValidationErrors);
  expect(err.errors).to.have.lengthOf(1);
  expect(err.errors[0]).to.deep.equal(expectedError);
}

describe('Unit | Domain | Validators | user-creation-validator', function() {

  let sandbox;
  let user;
  let recaptchaToken;

  beforeEach(() => {
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.net',
      password: 'password1234',
      cgu: true,
    });
    recaptchaToken = 'recaptcha_token';

    sandbox = sinon.sandbox.create();
    sandbox.stub(googleReCaptcha, 'verify');
    sandbox.stub(userValidator, 'validate');
    sandbox.stub(userRepository, 'isEmailAvailable');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      beforeEach(() => {
        googleReCaptcha.verify.resolves();
        userValidator.validate.resolves();
        userRepository.isEmailAvailable.resolves();
      });

      it('should resolve (with no value) when validation is successful', () => {
        // when
        const promise = userCreationValidator.validate(user, recaptchaToken);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when reCAPTCHA validation fails', () => {

      beforeEach(() => {
        userValidator.validate.resolves();
        userRepository.isEmailAvailable.resolves();
      });

      it('should reject with well formatted error when an error occurs during reCAPTCHA validation', () => {
        // given
        const someNetworkError = new Error('Some error calling Google reCAPTCHA service');
        googleReCaptcha.verify.rejects(someNetworkError);

        // when
        const promise = userCreationValidator.validate(user, recaptchaToken);

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
          source: { pointer: '/data/attributes/recaptcha-token' },
          title: 'Invalid user data attribute "recaptchaToken"',
          detail: 'Merci de cocher la case ci-dessous :',
          meta: {
            field: 'recaptchaToken'
          }
        };
        googleReCaptcha.verify.rejects(new InvalidRecaptchaTokenError());

        // when
        const promise = userCreationValidator.validate(user, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserCreationValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });
    });

    context('when user validation fails', () => {

      it('should reject with the errors from user validation', () => {
        // given
        const expectedError = {
          source: { pointer: '/data/attributes/first-name' },
          title: 'Invalid user data attribute "firstName"',
          detail: 'Votre prénom n’est pas renseigné.',
          meta: {
            field: 'firstName'
          }
        };

        googleReCaptcha.verify.resolves();
        userRepository.isEmailAvailable.resolves();
        userValidator.validate.rejects([expectedError]);

        // when
        const promise = userCreationValidator.validate(user, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserCreationValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

    });

    context('when email availability fails', () => {

      it('should reject with the errors from email availability validation', () => {
        // given
        const expectedError = {
          source: { pointer: '/data/attributes/email' },
          title: 'Invalid user data attribute "email"',
          detail: 'L’adresse électronique est déjà utilisée.',
          meta: {
            field: 'email'
          }
        };

        googleReCaptcha.verify.resolves();
        userValidator.validate.resolves();
        userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());

        // when
        const promise = userCreationValidator.validate(user, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserCreationValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedError));
      });

      it('should reject with only email joi errors if both email availability error and email joi errors', () => {
        // given
        // given
        const expectedEmailValidationError = {
          source: { pointer: '/data/attributes/email' },
          title: 'Invalid user data attribute "email"',
          detail: 'Email validation error',
          meta: {
            field: 'email'
          }
        };

        googleReCaptcha.verify.resolves();
        userValidator.validate.rejects([expectedEmailValidationError]);
        userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());

        // when
        const promise = userCreationValidator.validate(user, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserCreationValidationErrors'))
          .catch((err) => _assertErrorMatchesWithExpectedOne(err, expectedEmailValidationError));
      });

    });

    context('when both user, email and reCAPTCHA validations fail', () => {

      it('should reject with the errors from user validation and reCAPTCHA', () => {
        // given
        const expectedReCAPTCHAError = {
          source: { pointer: '/data/attributes/recaptcha-token' },
          title: 'Invalid user data attribute "recaptchaToken"',
          detail: 'Merci de cocher la case ci-dessous :',
          meta: {
            field: 'recaptchaToken'
          }
        };
        const expectedEmailError = {
          source: { pointer: '/data/attributes/email' },
          title: 'Invalid user data attribute "email"',
          detail: 'L’adresse électronique est déjà utilisée.',
          meta: {
            field: 'email'
          }
        };
        const expectedUserError = {
          source: { pointer: '/data/attributes/first-name' },
          title: 'Invalid user data attribute "firstName"',
          detail: 'Votre prénom n’est pas renseigné.',
          meta: {
            field: 'firstName'
          }
        };

        googleReCaptcha.verify.rejects(new InvalidRecaptchaTokenError());
        userRepository.isEmailAvailable.rejects(new AlreadyRegisteredEmailError());
        userValidator.validate.rejects([expectedUserError]);

        // when
        const promise = userCreationValidator.validate(user, recaptchaToken);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with UserCreationValidationErrors'))
          .catch((err) => {
            expect(err).to.be.an.instanceof(UserCreationValidationErrors);
            expect(err.errors).to.have.lengthOf(3);
            expect(err.errors[0]).to.deep.equal(expectedReCAPTCHAError);
            expect(err.errors[1]).to.deep.equal(expectedUserError);
            expect(err.errors[2]).to.deep.equal(expectedEmailError);
          });
      });

    });

  });
});
