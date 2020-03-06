const { expect, sinon, catchErr } = require('../../../test-helper');
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
    userValidator.validate.returns();
    encryptionService.hashPassword.resolves(encryptedPassword);
    mailService.sendAccountCreationEmail.resolves();
    reCaptchaValidator.verify.resolves();
  });

  context('step validation of user', () => {

    it('should check the non existence of email in UserRepository', async () => {
      // given
      userRepository.isEmailAvailable.resolves();

      // when
      await createUser({
        user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
      });

      // then
      expect(userRepository.isEmailAvailable).to.have.been.calledWith(userEmail);
    });

    it('should validate the user', async () => {
      // given
      userValidator.validate.returns();

      // when
      await createUser({
        user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
      });

      //then
      expect(userValidator.validate).to.have.been.calledWith({ user });
    });

    it('should validate the token', async () => {
      // when
      await createUser({
        user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
      });

      // then
      expect(reCaptchaValidator.verify).to.have.been.calledWith(reCaptchaToken);
    });

    context('when user email is already used', () => {

      it('should reject with an error EntityValidationError on email already registered', async () => {
        // given
        const emailExistError = new AlreadyRegisteredEmailError('email already exists');
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'email',
              message: 'Cette adresse e-mail est déjà enregistrée, connectez-vous.',
            }
          ]
        });

        userRepository.isEmailAvailable.rejects(emailExistError);

        // when
        const error = await catchErr(createUser)({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
      });

    });

    context('when user validator fails', () => {

      it('should reject with an error EntityValidationError containing the entityValidationError', async () => {
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

        userValidator.validate.throws(expectedValidationError);

        // when
        const error = await catchErr(createUser)({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
      });

    });

    context('when reCAPTCHA token is not valid', () => {

      it('should reject with an error EntityValidationError containing the entityValidationError', async () => {
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
        const error = await catchErr(createUser)({
          user, reCaptchaToken, userRepository, userValidator, reCaptchaValidator, encryptionService, mailService
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
      });

    });

    context('when user email is already in use, user validator fails and invalid captcha token', () => {

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

      it('should reject with an error EntityValidationError containing the entityValidationError and the AlreadyRegisteredEmailError', async () => {
        // given
        userRepository.isEmailAvailable.rejects(emailExistError);
        userValidator.validate.throws(entityValidationError);
        reCaptchaValidator.verify.rejects(invalidReCaptchaTokenError);

        // when
        const error = await catchErr(createUser)({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.have.lengthOf(4);
      });
    });
  });

  context('when user email is not defined', () => {

    it('should not check the non existence of email in UserRepository', async () => {
      // given
      const user = { email: null };

      // when
      await createUser({
        user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
      });

      // then
      expect(userRepository.isEmailAvailable).to.not.have.been.called;
    });
  });

  context('when user is valid', () => {

    context('step hash password and save user', () => {

      it('should encrypt the password', async () => {
        // when
        await createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        expect(encryptionService.hashPassword).to.have.been.calledWith(password);
      });

      it('should check if the password has been correctly encrypted, because we have a bug on this', async () => {
        // given
        encryptionService.hashPassword.resolves(password);

        // when
        const error = await catchErr(createUser)({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Erreur lors de l‘encryption du mot passe de l‘utilisateur');
      });

      it('should save the user with a properly encrypted password', async () => {
        // given
        const userWithEncryptedPassword = new User({ email: userEmail, password: encryptedPassword });

        // when
        await createUser({
          user, reCaptchaToken, userRepository, reCaptchaValidator, encryptionService, mailService
        });

        // then
        expect(userRepository.create).to.have.been.calledWith(userWithEncryptedPassword);
      });
    });

    context('step send account creation email to user', () => {
      const user = new User({ email: userEmail });

      it('should send the account creation email', async () => {
        // when
        await createUser({
          user,
          reCaptchaToken,
          userRepository,
          reCaptchaValidator,
          encryptionService,
          mailService,
        });

        // then
        expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(userEmail);
      });
    });

    it('should return saved user (with id)', async () => {
      // when
      const actualSavedUser = await createUser({
        user,
        reCaptchaToken,
        userRepository,
        reCaptchaValidator,
        encryptionService,
        mailService,
      });

      // then
      expect(actualSavedUser).to.deep.equal(savedUser);
    });
  });
});
