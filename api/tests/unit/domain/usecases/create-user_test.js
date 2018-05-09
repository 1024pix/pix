const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const errors = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | create-user', () => {

  const userRepository = {
    isEmailAvailable: () => undefined,
    save: () => undefined,
  };
  const userValidator = { validate: () => undefined };
  const encryptionService = { hashPassword: () => undefined };
  const mailService = { sendAccountCreationEmail: () => undefined };

  const userId = 123;
  const userEmail = 'test@example.net';
  const password = 'PASSWORD';
  const user = new User({ email: userEmail, password });
  const encryptedPassword = '3ncrypt3dP@$$w@rd';
  const savedUser = new User({ id: userId, email: userEmail });

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(userRepository, 'isEmailAvailable');
    sandbox.stub(userRepository, 'save');
    sandbox.stub(userValidator, 'validate');
    sandbox.stub(encryptionService, 'hashPassword');
    sandbox.stub(mailService, 'sendAccountCreationEmail');

    userRepository.isEmailAvailable.resolves();
    userRepository.save.resolves(savedUser);
    userValidator.validate.resolves();
    encryptionService.hashPassword.resolves(encryptedPassword);
    mailService.sendAccountCreationEmail.resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('step validation of user', () => {

    context('when user email is already in use', () => {

      let promise;
      const emailExistError = new errors.AlreadyRegisteredEmailError('email already exists');

      beforeEach(() => {
        // given
        userRepository.isEmailAvailable.rejects(emailExistError);

        // when
        promise = usecases.createUser({
          user,
          userRepository,
          userValidator,
          encryptionService,
          mailService,
        });
      });

      it('should check the non existence of email in UserRepository', () => {
        // then
        return promise
          .catch(() => {
            expect(userRepository.isEmailAvailable).to.have.been.calledWith(userEmail);
          });
      });

      it('should reject with an error FormValidationError containing an AlreadyRegisteredEmailError', () => {
        // then
        return Promise.all([
          expect(promise).to.be.rejectedWith(errors.FormValidationError),
          promise.catch((error) => expect(error.errors).to.deep.equal([emailExistError])),
        ]);
      });
    });

    context('when user validator fails', () => {

      let promise;
      const entityValidationError = new errors.EntityValidationErrors([
        {
          attribute: 'firstName',
          message: 'Votre prénom n’est pas renseigné.',
        },
        {
          attribute: 'password',
          message: 'Votre mot de passe n’est pas renseigné.',
        },
      ]);

      beforeEach(() => {
        // given
        userValidator.validate.rejects(entityValidationError);

        // when
        promise = usecases.createUser({
          user,
          userRepository,
          userValidator,
          encryptionService,
          mailService,
        });
      });

      it('should validate the user', () => {
        //then
        return promise
          .catch(() => {
            expect(userValidator.validate).to.have.been.calledWith(user);
          });
      });

      it('should reject with an error FormValidationError containing the entityValidationError', () => {
        //then
        return Promise.all([
          expect(promise).to.be.rejectedWith(errors.FormValidationError),
          promise.catch((error) => expect(error.errors).to.deep.equal([entityValidationError])),
        ]);
      });
    });

    context('when reCAPTCHA token is not valid', () => {

      let promise;
      const entityValidationError = new errors.EntityValidationErrors([
        {
          attribute: 'firstName',
          message: 'Votre prénom n’est pas renseigné.',
        },
        {
          attribute: 'password',
          message: 'Votre mot de passe n’est pas renseigné.',
        },
      ]);

      beforeEach(() => {
        // given
        userValidator.validate.rejects(entityValidationError);

        // when
        promise = usecases.createUser({
          user,
          userRepository,
          userValidator,
          encryptionService,
          mailService,
        });
      });

      it('should validate the user', () => {
        //then
        return promise
          .catch(() => {
            expect(userValidator.validate).to.have.been.calledWith(user);
          });
      });

      it('should reject with an error FormValidationError containing the entityValidationError', () => {
        //then
        return Promise.all([
          expect(promise).to.be.rejectedWith(errors.FormValidationError),
          promise.catch((error) => expect(error.errors).to.deep.equal([entityValidationError])),
        ]);
      });
    });

    context('when user email is already in use and user validator fails', () => {

      let promise;
      const entityValidationError = new errors.EntityValidationErrors([
        {
          attribute: 'firstName',
          message: 'Votre prénom n’est pas renseigné.',
        },
        {
          attribute: 'password',
          message: 'Votre mot de passe n’est pas renseigné.',
        },
      ]);
      const emailExistError = new errors.AlreadyRegisteredEmailError('email already exists');

      it('should reject with an error FormValidationError containing the entityValidationError and the AlreadyRegisteredEmailError', () => {
        // given
        userRepository.isEmailAvailable.rejects(emailExistError);
        userValidator.validate.rejects(entityValidationError);

        // when
        promise = usecases.createUser({
          user,
          userRepository,
          userValidator,
          encryptionService,
          mailService,
        });

        // then
        return Promise.all([
          expect(promise).to.be.rejectedWith(errors.FormValidationError),
          promise.catch((error) => expect(error.errors).to.deep.equal([emailExistError, entityValidationError])),
        ]);
      });
    });
  });

  context('when user is valid', () => {

    context('step hash password and save user', () => {

      // given
      let promise;
      const userWithEncryptedPassword = new User({ email: userEmail, password: encryptedPassword });

      beforeEach(() => {
        // when
        promise = usecases.createUser({
          user,
          userRepository,
          userValidator,
          encryptionService,
          mailService,
        });
      });

      it('should encrypt the password', () => {
        // then
        return promise
          .then(() => {
            expect(encryptionService.hashPassword).to.have.been.calledWith(password);
          });
      });

      it('should save the user with a properly encrypted password', () => {
        // then
        return promise
          .then(() => {
            expect(userRepository.save).to.have.been.calledWith(userWithEncryptedPassword);
          });
      });
    });

    context('step send account creation email to user', () => {

      // given
      let promise;
      const user = new User({ email: userEmail });

      beforeEach(() => {
        // when
        promise = usecases.createUser({
          user,
          userRepository,
          userValidator,
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
      const promise = usecases.createUser({
        user,
        userRepository,
        userValidator,
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
