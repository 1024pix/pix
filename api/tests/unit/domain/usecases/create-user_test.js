import { catchErr, expect, sinon } from '../../../test-helper';
import { AlreadyRegisteredEmailError, EntityValidationError } from '../../../../lib/domain/errors';
import passwordValidator from '../../../../lib/domain/validators/password-validator';
import userValidator from '../../../../lib/domain/validators/user-validator';
import User from '../../../../lib/domain/models/User';
import createUser from '../../../../lib/domain/usecases/create-user';

describe('Unit | UseCase | create-user', function () {
  const userId = 123;
  const userEmail = 'test@example.net';
  const password = 'Password123';
  const user = new User({ email: userEmail });
  const hashedPassword = 'ABCDEF1234';
  const locale = 'fr-fr';
  const savedUser = new User({ id: userId, email: userEmail });

  let campaignCode;
  let authenticationMethodRepository;
  let userRepository;
  let userToCreateRepository;
  let campaignRepository;
  let encryptionService;
  let mailService;
  let userService;

  beforeEach(function () {
    authenticationMethodRepository = {};
    userRepository = {
      checkIfEmailIsAvailable: sinon.stub(),
    };
    userToCreateRepository = {
      create: sinon.stub(),
    };
    campaignRepository = {
      getByCode: sinon.stub(),
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

    userRepository.checkIfEmailIsAvailable.resolves();
    userToCreateRepository.create.resolves(savedUser);

    userValidator.validate.returns();
    passwordValidator.validate.returns();

    encryptionService.hashPassword.resolves(hashedPassword);
    mailService.sendAccountCreationEmail.resolves();
    userService.createUserWithPassword.resolves(savedUser);

    campaignCode = 'AZERTY123';
  });

  context('step validation of data', function () {
    it('should check the non existence of email in UserRepository', async function () {
      // given
      userRepository.checkIfEmailIsAvailable.resolves();

      // when
      await createUser({
        user,
        password,
        campaignCode,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        userToCreateRepository,
        encryptionService,
        mailService,
        userService,
      });

      // then
      expect(userRepository.checkIfEmailIsAvailable).to.have.been.calledWith(userEmail);
    });

    it('should validate the user', async function () {
      // when
      await createUser({
        user,
        password,
        campaignCode,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        userToCreateRepository,
        encryptionService,
        mailService,
        userService,
      });

      //then
      expect(userValidator.validate).to.have.been.calledWith({ user });
    });

    it('should validate the password', async function () {
      // when
      await createUser({
        user,
        password,
        campaignCode,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        userToCreateRepository,
        encryptionService,
        mailService,
        userService,
      });

      // then
      expect(passwordValidator.validate).to.have.been.calledWith(password);
    });

    context('when user email is already used', function () {
      it('should reject with an error EntityValidationError on email already registered', async function () {
        // given
        const emailExistError = new AlreadyRegisteredEmailError('email already exists');
        const expectedValidationError = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'email',
              message: 'ALREADY_REGISTERED_EMAIL',
            },
          ],
        });

        userRepository.checkIfEmailIsAvailable.rejects(emailExistError);

        // when
        const error = await catchErr(createUser)({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
      });
    });

    context('when user validator fails', function () {
      it('should reject with an error EntityValidationError containing the entityValidationError', async function () {
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
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.deep.equal(expectedValidationError.invalidAttributes);
      });
    });

    context('when user email is already in use, user validator fails', function () {
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

      it('should reject with an error EntityValidationError containing the entityValidationError and the AlreadyRegisteredEmailError', async function () {
        // given
        userRepository.checkIfEmailIsAvailable.rejects(emailExistError);
        userValidator.validate.throws(entityValidationError);

        // when
        const error = await catchErr(createUser)({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(error).to.be.instanceOf(EntityValidationError);
        expect(error.invalidAttributes).to.have.lengthOf(3);
      });
    });

    context('when user has accepted terms of service', function () {
      it('should update the validation date', async function () {
        // given
        const user = new User({
          email: userEmail,
          cgu: true,
        });

        // when
        await createUser({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(user.lastTermsOfServiceValidatedAt).to.be.an.instanceOf(Date);
      });
    });

    context('when user has not accepted terms of service', function () {
      it('should not update the validation date', async function () {
        // given
        const user = new User({
          email: userEmail,
          cgu: false,
        });

        // when
        await createUser({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(user.lastTermsOfServiceValidatedAt).not.to.be.an.instanceOf(Date);
      });
    });
  });

  context("when user's email is not defined", function () {
    it('should not check the absence of email in UserRepository', async function () {
      // given
      const user = { email: null };

      // when
      await createUser({
        user,
        password,
        campaignCode,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        encryptionService,
        mailService,
        userService,
      });

      // then
      expect(userRepository.checkIfEmailIsAvailable).to.not.have.been.called;
    });
  });

  context('when user is valid', function () {
    context('step hash password and save user', function () {
      it('should encrypt the password', async function () {
        // when
        await createUser({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(encryptionService.hashPassword).to.have.been.calledWith(password);
      });

      it('should throw Error when hash password function fails', async function () {
        // given
        encryptionService.hashPassword.rejects(new Error());

        // when
        const error = await catchErr(createUser)({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(error).to.be.instanceOf(Error);
      });

      it('should save the user with a properly encrypted password', async function () {
        // when
        await createUser({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(userService.createUserWithPassword).to.have.been.calledWith({
          user,
          hashedPassword,
          userToCreateRepository,
          authenticationMethodRepository,
        });
      });
    });

    context('step send account creation email to user', function () {
      const user = new User({ email: userEmail });

      it('should send the account creation email', async function () {
        // given
        campaignRepository.getByCode.resolves({ organizationId: 1 });
        const expectedRedirectionUrl = `https://app.pix.fr/campagnes/${campaignCode}`;

        // when
        await createUser({
          user,
          password,
          campaignCode,
          locale,
          authenticationMethodRepository,
          campaignRepository,
          userRepository,
          userToCreateRepository,
          encryptionService,
          mailService,
          userService,
        });

        // then
        expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(userEmail, locale, expectedRedirectionUrl);
      });

      describe('when campaignCode is null', function () {
        campaignCode = null;

        it('should send the account creation email with null redirectionUrl', async function () {
          // given
          const expectedRedirectionUrl = null;

          // when
          await createUser({
            user,
            password,
            campaignCode,
            locale,
            authenticationMethodRepository,
            campaignRepository,
            userRepository,
            userToCreateRepository,
            encryptionService,
            mailService,
            userService,
          });

          // then
          expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(
            userEmail,
            locale,
            expectedRedirectionUrl
          );
        });
      });

      describe('when campaignCode is not valid', function () {
        campaignCode = 'NOT-VALID';

        it('should send the account creation email with null redirectionUrl', async function () {
          // given
          const expectedRedirectionUrl = null;
          campaignRepository.getByCode.resolves(null);

          // when
          await createUser({
            user,
            password,
            campaignCode,
            locale,
            authenticationMethodRepository,
            campaignRepository,
            userRepository,
            userToCreateRepository,
            encryptionService,
            mailService,
            userService,
          });

          // then
          expect(mailService.sendAccountCreationEmail).to.have.been.calledWith(
            userEmail,
            locale,
            expectedRedirectionUrl
          );
        });
      });
    });

    it('should return saved user', async function () {
      // when
      const createdUser = await createUser({
        user,
        password,
        campaignCode,
        locale,
        authenticationMethodRepository,
        campaignRepository,
        userRepository,
        userToCreateRepository,
        encryptionService,
        mailService,
        userService,
      });

      // then
      expect(createdUser).to.deep.equal(savedUser);
    });
  });
});
