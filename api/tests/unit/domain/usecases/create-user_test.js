const { expect, sinon } = require('../../../test-helper');
const createUser = require('../../../../lib/domain/usecases/create-user');
const { AlreadyRegisteredEmailError, InvalidRecaptchaTokenError, EntityValidationError } = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');
const userValidator = require('../../../../lib/domain/validators/user-validator');

describe('Unit | UseCase | create-user', () => {

  const userRepository = {
    isEmailAvailable: () => undefined,
    create: () => undefined,
  };
  const encryptionService = { hashPassword: () => undefined };
  const mailService = { sendAccountCreationEmail: () => undefined };
  const reCaptchaValidator = { verify: () => undefined };

  const userId = 123;
  const userEmail = 'test@example.net';
  const password = 'PASSWORD';
  const reCaptchaToken = 'ReCaptchaToken';
  const user = new User({ email: userEmail, password });
  const encryptedPassword = '3ncrypt3dP@$$w@rd';
  const savedUser = new User({ id: userId, email: userEmail });

  beforeEach(() => {
    sinon.stub(userRepository, 'isEmailAvailable');
    sinon.stub(userRepository, 'create');
    sinon.stub(userValidator, 'validate');
    sinon.stub(encryptionService, 'hashPassword');
    sinon.stub(mailService, 'sendAccountCreationEmail');
    sinon.stub(reCaptchaValidator, 'verify');

    userRepository.isEmailAvailable.resolves();
    userRepository.create.resolves(savedUser);
    userValidator.validate.resolves();
    encryptionService.hashPassword.resolves(encryptedPassword);
    mailService.sendAccountCreationEmail.resolves();
    reCaptchaValidator.verify.resolves();
  });

  context('step validation of user', () => {

    it('should check the non existence of email in UserRepository', () => {
      // given
      userRepository.isEmailAvailable.resolves();

      // when
      const promise = createUser({
        user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
      });

      // then
      return promise
        .then(() => {
          expect(userRepository.isEmailAvailable).to.have.been.calledWith(userEmail);
        });
    });

    it('should validate the user', () => {
      // given
      userValidator.validate.resolves();

      // when
      const promise = createUser({
        user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
      });

      //then
      return promise
        .then(() => {
          expect(userValidator.validate).to.have.been.calledWith(user);
        });
    });

    it('should validate the token', () => {
      // when
      const promise = createUser({
        user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
      });

      //then
      return promise
        .then(() => {
          expect(reCaptchaValidator.verify).to.have.been.calledWith(reCaptchaToken);
        });
    });

    context('when user email is already used', () => {

      it('should reject with an error EntityValidationError on email already registered', () => {
        // given
        const emailExistError = new AlreadyRegisteredEmailError('email already exists');
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'email',
              message: 'Cette adresse électronique est déjà enregistrée, connectez-vous.',
            }
          ]
        });

        userRepository.isEmailAvailable.rejects(emailExistError);

        // when
        const promise = createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((error) => {
            expect(error).to.be.instanceOf(EntityValidationError);
            expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
          });
      });

    });

    context('when user validator fails', () => {

      it('should reject with an error EntityValidationError containing the entityValidationError', () => {
        // given
        const expectedValidationError = new EntityValidationError({
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

        // when
        const promise = createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        //then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((error) => {
            expect(error).to.be.instanceOf(EntityValidationError);
            expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
          });
      });

    });

    context('when reCAPTCHA token is not valid', () => {

      it('should reject with an error EntityValidationError containing the entityValidationError', () => {
        // given
        const invalidReCaptchaTokenError = new InvalidRecaptchaTokenError('Invalid reCaptcha token');
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'recaptchaToken',
              message: 'Merci de cocher la case ci-dessous :'
            }
          ]
        });

        reCaptchaValidator.verify.rejects(invalidReCaptchaTokenError);

        // when
        const promise = createUser({
          user, reCaptchaToken, userRepository, userValidator, reCaptchaValidator, encryptionService, mailService
        });

        //then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((error) => {
            expect(error).to.be.instanceOf(EntityValidationError);
            expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
          });
      });

    });

    context('when user email is already in use, user validator fails and invalid captcha token', () => {

      let promise;
      const entityValidationError = new EntityValidationError({
        invalidAttributes: [
          {
            attribute: 'firstName',
            message: 'Votre prénom n’est pas renseigné.',
          },
          {
            attribute: 'password',
            message: 'Votre mot de passe n’est pas renseigné.',
          }
        ]
      });
      const emailExistError = new AlreadyRegisteredEmailError('email already exists');
      const invalidReCaptchaTokenError = new InvalidRecaptchaTokenError('Invalid reCaptcha token');

      it('should reject with an error EntityValidationError containing the entityValidationError and the AlreadyRegisteredEmailError', () => {
        // given
        userRepository.isEmailAvailable.rejects(emailExistError);
        userValidator.validate.rejects(entityValidationError);
        reCaptchaValidator.verify.rejects(invalidReCaptchaTokenError);

        // when
        promise = createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        return promise
          .then(() => expect.fail('Expected rejection with errors'))
          .catch((error) => {
            expect(error).to.be.instanceOf(EntityValidationError);
            expect(error.invalidAttributes).to.have.lengthOf(4);
          });
      });
    });
  });

  context('when user is valid', () => {

    context('step hash password and save user', () => {

      it('should encrypt the password', () => {
        // when
        const promise = createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        return promise
          .then(() => {
            expect(encryptionService.hashPassword).to.have.been.calledWith(password);
          });
      });

      it('should check if the password has been correctly encrypted, because we have a bug on this', () => {
        // given
        encryptionService.hashPassword.resolves(password);

        // when
        const promise = createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        return promise
          .catch((error) => {
            expect(error).to.be.instanceOf(Error);
            expect(error.message).to.equal('Erreur lors de l‘encryption du mot passe de l‘utilisateur');

          });
      });

      it('should save the user with a properly encrypted password', () => {
        // given
        const userWithEncryptedPassword = new User({ email: userEmail, password: encryptedPassword });

        // when
        const promise = createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        return promise
          .then(() => {
            expect(userRepository.create).to.have.been.calledWith(userWithEncryptedPassword);
          });
      });
    });

    context('step send account creation email to user', () => {

      // given
      let promise;
      const user = new User({ email: userEmail });

      beforeEach(() => {
        // when
        promise = createUser({
          user,
          reCaptchaToken,
          userRepository,
          reCaptchaValidator,
          encryptionService,
          mailService,
        });
      });

      // then
      it('should send the account creation email', () => {
        return promise
          .then(() => {
            expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(userEmail);
          });
      });
    });

    it('should return saved user (with id)', () => {
      // when
      const promise = createUser({
        user,
        reCaptchaToken,
        userRepository,
        reCaptchaValidator,
        encryptionService,
        mailService,
      });

      // then
      return promise
        .then((user) => {
          expect(user).to.deep.equal(savedUser);
        });
    });
  });
});
