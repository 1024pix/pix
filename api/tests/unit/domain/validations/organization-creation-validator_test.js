const { expect, sinon } = require('../../../test-helper');
const organizationCreationValidator = require('../../../../lib/domain/validators/organization-creation-validator');
const userValidator = require('../../../../lib/domain/validators/user-validator');
const organizationValidator = require('../../../../lib/domain/validators/organization-validator');
const User = require('../../../../lib/domain/models/User');
const Organization = require('../../../../lib/domain/models/Organization');
const errors = require('../../../../lib/domain/errors');

describe('Unit | Domain | Validators | organization-creation-validator', function() {

  const userRepository = { isEmailAvailable: () => undefined };

  let sandbox;
  let user;
  let organization;

  beforeEach(() => {
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.net',
      password: 'password1234',
      cgu: true,
    });
    organization = new Organization({
      name: 'Acme',
      type: 'PRO',
      email: user.email,
    });

    sandbox = sinon.sandbox.create();
    sandbox.stub(userValidator, 'validate');
    sandbox.stub(organizationValidator, 'validate');
    sandbox.stub(userRepository, 'isEmailAvailable');

    userRepository.isEmailAvailable.resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#validate', () => {

    context('when validation is successful', () => {

      beforeEach(() => {
        userValidator.validate.resolves();
        organizationValidator.validate.resolves();
      });

      it('should resolve (with no value) when validation is successful', () => {
        // when
        const promise = organizationCreationValidator.validate(user, organization, userRepository);

        // then
        return expect(promise).to.be.fulfilled;
      });
    });

    context('when user email is already used', () => {

      it('should reject with an error EntityValidationError on email already registered', () => {
        // given
        const emailExistError = new errors.AlreadyRegisteredEmailError('email already exists');
        const expectedValidationError = new errors.EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'email',
              message: 'Cette adresse electronique est déjà enregistrée.',
            }
          ]
        });

        userRepository.isEmailAvailable.rejects(emailExistError);
        userValidator.validate.resolves();
        organizationValidator.validate.resolves();

        // when
        const promise = organizationCreationValidator.validate(user, organization, userRepository);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((error) => {
            expect(error).to.be.instanceOf(errors.EntityValidationError);
            expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
          });
      });

    });

    context('when user validation fails', () => {

      it('should reject with the errors from user validation', () => {
        // given
        const expectedValidationError = new errors.EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'firstName',
              message: 'Votre prénom n’est pas renseigné.',
            },
            {
              attribute: 'password',
              message: 'Votre mot de passe n’est pas renseigné.',
            },
          ]
        });

        userValidator.validate.rejects(expectedValidationError);
        organizationValidator.validate.resolves();

        // when
        const promise = organizationCreationValidator.validate(user, organization, userRepository);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((error) => {
            expect(error).to.be.instanceOf(errors.EntityValidationError);
            expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
          });
      });

    });

    context('when organization validation fails', () => {

      it('should reject with the errors from organization validation', () => {
        // given
        const expectedValidationError = new errors.EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'type',
              message: 'Le type n‘est pas renseigné.',
            }
          ]
        });

        organizationValidator.validate.rejects(expectedValidationError);
        userValidator.validate.resolves();

        // when
        const promise = organizationCreationValidator.validate(user, organization, userRepository);

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((error) => {
            expect(error).to.be.instanceOf(errors.EntityValidationError);
            expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
          });
      });

    });

    context('when both user and organization validations fail', () => {

      it('should reject with the errors from user and organization validations', () => {
        // given
        const expectedUserValidationError = new errors.EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'firstName',
              message: 'Votre prénom n’est pas renseigné.',
            }
          ]
        });
        const expectedOrgaValidationError = new errors.EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'type',
              message: 'Le type de l’organisation doit avoir l’une des valeurs suivantes: SCO, SUP, PRO.',
            }
          ]
        });

        userValidator.validate.rejects(expectedUserValidationError);
        organizationValidator.validate.rejects(expectedOrgaValidationError);

        // when
        const promise = organizationCreationValidator.validate(user, organization, userRepository);

        // then
        return promise
          .catch((error) => {
            expect(error).to.be.instanceOf(errors.EntityValidationError);
            expect(error.invalidAttributes).to.have.lengthOf(2);
          });
      });

    });
  });
});
