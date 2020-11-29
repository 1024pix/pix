const { catchErr, expect, sinon } = require('../../../test-helper');

const {
  AlreadyRegisteredEmailError,
  InvalidRecaptchaTokenError,
  EntityValidationError,
} = require('../../../../lib/domain/errors');

const passwordValidator = require('../../../../lib/domain/validators/password-validator');
const userValidator = require('../../../../lib/domain/validators/user-validator');

const User = require('../../../../lib/domain/models/User');

const createUser = require('../../../../lib/domain/usecases/create-user');

describe('Unit | UseCase | create-user', () => {

  const userId = 123;
  const userEmail = 'test@example.net';
  const password = 'Password123';
  const reCaptchaToken = 'ReCaptchaToken';
  const user = new User({ email: userEmail });
  const hashedPassword = 'ABCDEF1234';
  const locale = 'fr-fr';
  const savedUser = new User({ id: userId, email: userEmail });

  let campaignCode;
  let authenticationMethodRepository;
  let userRepository;
  let campaignRepository;
  let reCaptchaValidator;
  let encryptionService;
  let mailService;
  let userService;

  beforeEach(() => {
    authenticationMethodRepository = {

    };
    userRepository = {
      isEmailAvailable: sinon.stub(),
      create: sinon.stub(),
    };
    campaignRepository = {
      getByCode: sinon.stub(),
    };

    reCaptchaValidator = {
      verify: sinon.stub(),
    };

    encryptionService = {
      hashPassword: sinon.stub(),
    };
    mailService = {
      sendAccountCreationEmail: sinon.stub(),
    };
    userService = {
      createUserWithPassword: sinon.stub(),
    };

    sinon.stub(userValidator, 'validate');
    sinon.stub(passwordValidator, 'validate');

    userRepository.isEmailAvailable.resolves();
    userRepository.create.resolves(savedUser);

    userValidator.validate.returns();
    passwordValidator.validate.returns();
    reCaptchaValidator.verify.resolves();

    encryptionService.hashPassword.resolves(hashedPassword);
    mailService.sendAccountCreationEmail.resolves();
    userService.createUserWithPassword.resolves(savedUser);

    campaignCode = 'AZERTY123';
  });

  context('step validation of data', () => {

    it('should check the non existence of email in UserRepository', async () => {
      // given
      userRepository.isEmailAvailable.resolves();

      // when
      await createUser({
        user,
        password,
        campaignCode,
        reCaptchaToken,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        reCaptchaValidator,
        encryptionService, mailService, userService,
      });

      // then
      expect(userRepository.isEmailAvailable).to.have.been.calledWith(userEmail);
    });

    it('should validate the user', async () => {
      // when
      await createUser({
        user,
        password,
        campaignCode,
        reCaptchaToken,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        reCaptchaValidator,
        encryptionService, mailService, userService,
      });

      //then
      expect(userValidator.validate).to.have.been.calledWith({ user });
    });

    it('should validate the password', async () => {
      // when
      await createUser({
        user,
        password,
        campaignCode,
        reCaptchaToken,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        reCaptchaValidator,
        encryptionService, mailService, userService,
      });

      // then
      expect(passwordValidator.validate).to.have.been.calledWith(password);
    });

    it('should validate the token', async () => {
      // when
      await createUser({
        user,
        password,
        campaignCode,
        reCaptchaToken,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        reCaptchaValidator,
        encryptionService, mailService, userService,
      });

      // then
      expect(reCaptchaValidator.verify).to.have.been.calledWith(reCaptchaToken);
    });

    context('when user email is already used', () => {

      it('should reject with an error EntityValidationError on email already registered', async () => {
        // given
        const emailExistError = new AlreadyRegisteredEmailError('email already exists');
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [{
            attribute: 'email',
            message: 'Cette adresse e-mail est déjà enregistrée, connectez-vous.',
          }],
        });

        userRepository.isEmailAvailable.rejects(emailExistError);

        // when
        const error = await catchErr(createUser)({
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
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
          ],
        });

        userValidator.validate.throws(expectedValidationError);

        // when
        const error = await catchErr(createUser)({
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
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
          invalidAttributes: [{
            attribute: 'recaptchaToken',
            message: 'Merci de cocher la case ci-dessous :',
          }],
        });

        reCaptchaValidator.verify.rejects(invalidReCaptchaTokenError);

        // when
        const error = await catchErr(createUser)({
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
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
          },
        ],
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
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.have.lengthOf(4);
      });
    });
  });

  context('when user\'s email is not defined', () => {

    it('should not check the absence of email in UserRepository', async () => {
      // given
      const user = { email: null };

      // when
      await createUser({
        user,
        password,
        campaignCode,
        reCaptchaToken,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        reCaptchaValidator,
        encryptionService, mailService, userService,
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
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
        });

        // then
        expect(encryptionService.hashPassword).to.have.been.calledWith(password);
      });

      it('should throw Error when hash password function fails', async () => {
        // given
        encryptionService.hashPassword.rejects(new Error());

        // when
        const error = await catchErr(createUser)({
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
        });

        // then
        expect(error).to.be.instanceOf(Error);
      });

      it('should save the user with a properly encrypted password', async () => {
        // when
        await createUser({
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
        });

        // then
        expect(userService.createUserWithPassword)
          .to.have.been.calledWith({
            user,
            hashedPassword,
            userRepository,
            authenticationMethodRepository,
          });
      });
    });

    context('step send account creation email to user', () => {
      const user = new User({ email: userEmail });

      it('should send the account creation email', async () => {
        // given
        campaignRepository.getByCode.resolves({ organizationId: 1 });
        const expectedRedirectionUrl = `https://app.pix.fr/campagnes/${campaignCode}`;

        // when
        await createUser({
          user,
          password,
          campaignCode,
          reCaptchaToken,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          reCaptchaValidator,
          encryptionService, mailService, userService,
        });

        // then
        expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(userEmail, locale, expectedRedirectionUrl);
      });

      describe('when campaignCode is null', () => {

        campaignCode = null;

        it('should send the account creation email with null redirectionUrl', async () => {
          // given
          const expectedRedirectionUrl = null;

          // when
          await createUser({
            user,
            password,
            campaignCode,
            reCaptchaToken,
            locale,
            authenticationMethodRepository,
            campaignRepository,
            userRepository,
            reCaptchaValidator,
            encryptionService, mailService, userService,
          });

          // then
          expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(userEmail, locale, expectedRedirectionUrl);
        });
      });

      describe('when campaignCode is not valid', () => {

        campaignCode = 'NOT-VALID';

        it('should send the account creation email with null redirectionUrl', async () => {
          // given
          const expectedRedirectionUrl = null;
          campaignRepository.getByCode.resolves(null);

          // when
          await createUser({
            user,
            password,
            campaignCode,
            reCaptchaToken,
            locale,
            authenticationMethodRepository,
            campaignRepository,
            userRepository,
            reCaptchaValidator,
            encryptionService, mailService, userService,
          });

          // then
          expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(userEmail, locale, expectedRedirectionUrl);
        });
      });
    });

    it('should return saved user', async () => {
      // when
      const createdUser = await createUser({
        user,
        password,
        campaignCode,
        reCaptchaToken,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        reCaptchaValidator,
        encryptionService, mailService, userService,
      });

      // then
      expect(createdUser).to.deep.equal(savedUser);
    });
  });
});
