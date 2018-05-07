const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const errors = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | create-user', () => {

  const userRepository = {};
  const userValidator = {};

  beforeEach(() => {
    userRepository.isEmailAvailable = sinon.stub();
    userRepository.isEmailAvailable.resolves();
    userValidator.validate = sinon.stub();
    userValidator.validate.resolves();
  });

  context('when user email is already in use', () => {

    let promise;
    const emailExistError = new errors.AlreadyRegisteredEmailError('email already exists');
    const email = 'test@example.net';

    beforeEach(() => {
      // given
      const user = new User({ email });
      userRepository.isEmailAvailable.rejects(emailExistError);

      // when
      promise = usecases.createUser({
        user,
        userRepository,
        userValidator,
      });
    });

    //then
    it('should call the userRepository with the right email', () => {
      return promise
        .catch(() => {
          expect(userRepository.isEmailAvailable).to.have.been.calledWith(email);
        });
    });

    it('should reject with an error FormValidationError containing an AlreadyRegisteredEmailError', () => {
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
    const user = new User({ email: 'test@example.net' });

    beforeEach(() => {
      // given
      userValidator.validate.rejects(entityValidationError);

      // when
      promise = usecases.createUser({
        user,
        userRepository,
        userValidator,
      });
    });

    //then
    it('should call the userValidator with the user', () => {
      return promise
        .catch(() => {
          expect(userValidator.validate).to.have.been.calledWith(user);
        });
    });

    it('should reject with an error FormValidationError containing the entityValidationError', () => {
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
    const user = new User({ email: 'test@example.net' });

    beforeEach(() => {
      // given
      userRepository.isEmailAvailable.rejects(emailExistError);
      userValidator.validate.rejects(entityValidationError);

      // when
      promise = usecases.createUser({
        user,
        userRepository,
        userValidator,
      });
    });

    //then
    it('should reject with an error FormValidationError containing the entityValidationError' +
      ' and the AlreadyRegisteredEmailError', () => {
      return Promise.all([
        expect(promise).to.be.rejectedWith(errors.FormValidationError),
        promise.catch((error) => expect(error.errors).to.deep.equal([emailExistError, entityValidationError])),
      ]);
    });
  });
});
