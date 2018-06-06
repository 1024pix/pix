const { sinon, expect, factory } = require('../../../test-helper');

const Boom = require('boom');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const User = require('../../../../lib/domain/models/User');

const userController = require('../../../../lib/application/users/user-controller');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const logger = require('../../../../lib/infrastructure/logger');

const mailService = require('../../../../lib/domain/services/mail-service');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userService = require('../../../../lib/domain/services/user-service');
const reCaptchaValidator = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const usecases = require('../../../../lib/domain/usecases');

const { PasswordResetDemandNotFoundError, InternalError, EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | user-controller', () => {

  describe('#save', () => {

    let boomBadRequestMock;

    let replyStub;
    let codeStub;

    let sandbox;
    const email = 'to-be-free@ozone.airplane';
    const deserializedUser = new User({ password: 'password_1234' });
    const savedUser = new User({ email });

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      boomBadRequestMock = sinon.mock(Boom);

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({
        code: codeStub,
      });

      sandbox.stub(logger, 'error').returns({});
      sandbox.stub(userSerializer, 'deserialize').returns(deserializedUser);
      sandbox.stub(userSerializer, 'serialize');
      sandbox.stub(userRepository, 'create').resolves(savedUser);
      sandbox.stub(validationErrorSerializer, 'serialize');
      sandbox.stub(encryptionService, 'hashPassword');
      sandbox.stub(mailService, 'sendAccountCreationEmail');
      sandbox.stub(usecases, 'createUser');
    });

    afterEach(() => {
      boomBadRequestMock.restore();
      sandbox.restore();
    });

    describe('when request is valid', () => {

      const request = {
        payload: {
          data: {
            attributes: {
              'first-name': 'John',
              'last-name': 'DoDoe',
              'email': 'john.dodoe@example.net',
              'password': 'A124B2C3#!',
              'cgu': true,
              'recaptcha-token': 'reCAPTCHAToken',
            },
          },
        },
      };

      beforeEach(() => {
        usecases.createUser.resolves(savedUser);
      });

      it('should return a serialized user and a 201 status code', () => {
        // given
        const expectedSerializedUser = { message: 'serialized user' };
        userSerializer.serialize.returns(expectedSerializedUser);

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(userSerializer.serialize).to.have.been.calledWith(savedUser);
          expect(replyStub).to.have.been.calledWith(expectedSerializedUser);
          expect(codeStub).to.have.been.calledWith(201);
        });
      });

      it('should call the user creation usecase', () => {
        // given
        const reCaptchaToken = 'reCAPTCHAToken';
        const useCaseParameters = {
          user: deserializedUser,
          reCaptchaToken,
          userRepository,
          reCaptchaValidator,
          encryptionService,
          mailService,
        };

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          expect(usecases.createUser).to.have.been.calledWith(useCaseParameters);
        });
      });
    });

    describe('when request is invalid', () => {

      const request = {
        payload: {
          data: {
            attributes: {
              firstName: '',
              lastName: '',
            },
          },
        },
      };

      it('should reply with code 422 when a validation error occurs', () => {
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

        const jsonApiValidationErrors = {
          errors: [
            {
              status: '422',
              source: { 'pointer': '/data/attributes/first-name' },
              title: 'Invalid user data attribute "firstName"',
              detail: 'Votre prénom n’est pas renseigné.'
            },
            {
              status: '422',
              source: { 'pointer': '/data/attributes/password' },
              title: 'Invalid user data attribute "password"',
              detail: 'Votre mot de passe n’est pas renseigné.'
            }
          ]
        };
        usecases.createUser.rejects(expectedValidationError);

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(codeStub, 422);
          sinon.assert.calledWith(replyStub, jsonApiValidationErrors);
        });
      });
    });

    describe('when an internal error is raised', () => {

      let raisedError;
      const request = {
        payload: {
          data: {
            attributes: {},
          },
        },
      };

      beforeEach(() => {
        raisedError = new Error('Something wrong is going on in Gotham City');
        usecases.createUser.rejects(raisedError);
      });

      it('should reply with a badImplementation', () => {
        // given
        const expectedError = {
          errors: [
            {
              status: '500',
              title: 'Internal Server Error',
              detail: 'Une erreur est survenue lors de la création de l’utilisateur'
            }
          ]
        };

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise
          .then(() => {
            expect(replyStub).to.have.been.calledWith(expectedError);
          });
      });

      it('should log the error', () => {
        // given
        boomBadRequestMock.expects('badImplementation').returns({});

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise
          .then(() => {
            expect(logger.error).to.have.been.calledWith(raisedError);
          });
      });

    });

  });

  describe('#getAuthenticatedUserProfile', () => {
    it('should be a function', () => {
      // then
      expect(userController.getAuthenticatedUserProfile).to.be.a('function');
    });
  });

  describe('#updatePassword', () => {

    describe('When payload is good (with a payload and a password attribute)', () => {

      let sandbox;
      let reply;
      const request = {
        params: {
          id: 7,
        },
        payload: {
          data: {
            attributes: {
              password: 'Pix2017!',
            },
          },
        },
      };
      const user = new BookshelfUser({
        id: 7,
        email: 'maryz@acme.xh',
      });
      let codeStub;

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(passwordResetService, 'hasUserAPasswordResetDemandInProgress');
        sandbox.stub(passwordResetService, 'invalidOldResetPasswordDemand');
        sandbox.stub(validationErrorSerializer, 'serialize');
        sandbox.stub(userRepository, 'updatePassword');
        sandbox.stub(userRepository, 'findUserById').resolves(user);
        sandbox.stub(encryptionService, 'hashPassword');
        codeStub = sinon.stub();
        reply = sandbox.stub().returns({
          code: () => {
          },
        });
      });

      afterEach(() => {
        sandbox.restore();
      });

      it('should get user by his id', () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();

        // when
        const promise = userController.updatePassword(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(userRepository.findUserById);
          sinon.assert.calledWith(userRepository.findUserById, request.params.id);
        });
      });

      it('should check if user has a current password reset demand', () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();

        // when
        const promise = userController.updatePassword(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(passwordResetService.hasUserAPasswordResetDemandInProgress);
          sinon.assert.calledWith(passwordResetService.hasUserAPasswordResetDemandInProgress, user.get('email'));
        });
      });

      it('should update user password with a hashed password', async () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        const encryptedPassword = '$2a$05$jJnoQ/YCvAChJmYW9AoQXe/k17mx2l2MqJBgXVo/R/ju4HblB2iAe';
        encryptionService.hashPassword.resolves(encryptedPassword);

        // when
        const promise = userController.updatePassword(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(userRepository.updatePassword);
          sinon.assert.calledOnce(encryptionService.hashPassword);
          sinon.assert.calledWith(encryptionService.hashPassword, request.payload.data.attributes.password);
          sinon.assert.calledWith(userRepository.updatePassword, request.params.id, encryptedPassword);
        });
      });

      it('should invalidate current password reset demand (mark as being used)', () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        userRepository.updatePassword.resolves();
        passwordResetService.invalidOldResetPasswordDemand.resolves();

        // when
        const promise = userController.updatePassword(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(passwordResetService.invalidOldResetPasswordDemand);
          sinon.assert.calledWith(passwordResetService.invalidOldResetPasswordDemand, user.get('email'));
        });
      });

      it('should reply with no content', () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        userRepository.updatePassword.resolves();
        passwordResetService.invalidOldResetPasswordDemand.resolves();

        // when
        const promise = userController.updatePassword(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(reply);
        });
      });

      describe('When user has not a current password reset demand', () => {
        it('should reply with a serialized Not found error', () => {
          // given
          const error = new PasswordResetDemandNotFoundError();
          const serializedError = {};
          validationErrorSerializer.serialize.returns(serializedError);
          passwordResetService.hasUserAPasswordResetDemandInProgress.rejects(error);

          // when
          const promise = userController.updatePassword(request, reply);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(reply);
            sinon.assert.calledWith(reply, serializedError);
            sinon.assert.calledOnce(validationErrorSerializer.serialize);
            sinon.assert.calledWith(validationErrorSerializer.serialize, error.getErrorMessage());
          });
        });
      });

      describe('When unknown error is handle', () => {
        it('should reply with a serialized  error', () => {
          // given
          const error = new InternalError();
          reply.returns({
            code: codeStub,
          });
          const serializedError = {};
          validationErrorSerializer.serialize.returns(serializedError);
          passwordResetService.hasUserAPasswordResetDemandInProgress.rejects(error);

          // when
          const promise = userController.updatePassword(request, reply);

          // then
          return promise.then(() => {
            sinon.assert.calledOnce(reply);
            sinon.assert.calledWith(reply, serializedError);
            sinon.assert.calledWith(codeStub, 500);
            sinon.assert.calledOnce(validationErrorSerializer.serialize);
            sinon.assert.calledWith(validationErrorSerializer.serialize, error.getErrorMessage());
          });
        });
      });

    });
  });

  describe('#getProfileToCertify', () => {

    let sandbox;
    let replyStub;

    const request = { params: { id: 1 } };
    const jsonAPI404error = { message: 'Error' };
    const jsonAPI500error = { message: 'Internal Error' };

    beforeEach(() => {
      replyStub = sinon.stub();
      sandbox = sinon.sandbox.create();

      sandbox.stub(userService, 'isUserExistingById').resolves(true);
      sandbox.stub(userService, 'getProfileToCertify').resolves([]);
      sandbox.stub(Boom, 'badRequest').returns(jsonAPI404error);
      sandbox.stub(Boom, 'badImplementation').returns(jsonAPI500error);
      sandbox.stub(logger, 'error').returns({});
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be a function', () => {
      expect(userController).to.have.property('getProfileToCertify').and.to.be.a('function');
    });

    context('when loading user competences fails', () => {
      it('should reply with an INTERNAL error', () => {
        // given
        const anyErrorFromProfileBuilding = new Error();
        userService.getProfileToCertify.rejects(anyErrorFromProfileBuilding);

        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(replyStub);

          sinon.assert.notCalled(Boom.badRequest);
          sinon.assert.calledOnce(Boom.badImplementation);
          sinon.assert.calledWith(Boom.badImplementation, anyErrorFromProfileBuilding);
        });
      });

      it('should log the error', () => {
        // given
        const anyErrorFromProfileBuilding = new Error();
        userService.getProfileToCertify.rejects(anyErrorFromProfileBuilding);

        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(logger.error);
          sinon.assert.calledWith(logger.error, anyErrorFromProfileBuilding);
        });
      });
    });

    context('when the user exists', () => {

      let clock;

      beforeEach(() => {
        clock = sinon.useFakeTimers();
      });

      afterEach(() => {
        clock.restore();
      });

      it('should load his current achieved assessments', () => {
        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(userService.getProfileToCertify);
          sinon.assert.calledWith(userService.getProfileToCertify, 1, '1970-01-01T00:00:00.000Z');
        });
      });

      it('should reply the skillProfile', () => {
        // when
        const promise = userController.getProfileToCertify(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, []);
        });
      });
    });
  });

  describe('#getAuthenticatedUser', () => {

    let sandbox;
    let userId;
    let codeStub;
    let replyStub;
    let request;

    beforeEach(() => {
      userId = 72;
      request = {
        auth: {
          credentials: {
            userId
          }
        }
      };

      sandbox = sinon.sandbox.create();
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({ code: codeStub });
      sandbox.stub(usecases, 'getUser').resolves();
      sandbox.stub(userSerializer, 'serialize');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should retrieve user informations from user Id', () => {
      // when
      const promise = userController.getAuthenticatedUser(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.getUser).to.have.been.calledWith({ userId, userRepository });
      });
    });

    it('should serialize the authenticated user', () => {
      // given
      const foundUser = factory.buildUser();
      usecases.getUser.resolves(foundUser);

      // when
      const promise = userController.getAuthenticatedUser(request, replyStub);

      // then
      return promise.then(() => {
        expect(userSerializer.serialize).to.have.been.calledWith(foundUser);
      });
    });

    it('should reply a serialized user', () => {
      // given
      usecases.getUser.resolves(factory.buildUser({
        id: 72,
        firstName: 'Jeanne',
        lastName: 'Bonnat',
        email: 'jeanne.bonnat@gmail.com',
        cgu: true,
      }));
      const serializedUser = {
        data: {
          type: 'users',
          id: 72,
          attributes: {
            'first-name': 'Jeanne',
            'last-name': 'Bonnat',
            'email': 'jeanne.bonnat@gmail.com',
            'cgu': true
          }
        }
      };
      userSerializer.serialize.returns(serializedUser);

      // when
      const promise = userController.getAuthenticatedUser(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith(serializedUser);
      });
    });

  });
});
