const { describe, it, afterEach, beforeEach, sinon, expect } = require('../../../test-helper');

const faker = require('faker');
const User = require('../../../../lib/domain/models/data/user');
const Boom = require('boom');

const userController = require('../../../../lib/application/users/user-controller');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const googleReCaptcha = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const { InvalidRecaptchaTokenError } = require('../../../../lib/infrastructure/validators/errors');
const logger = require('../../../../lib/infrastructure/logger');

const mailService = require('../../../../lib/domain/services/mail-service');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const UserRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userService = require('../../../../lib/domain/services/user-service');

const { PasswordResetDemandNotFoundError, InternalError } = require('../../../../lib/domain/errors');

describe('Unit | Controller | user-controller', () => {

  describe('#save', () => {

    let boomBadRequestMock;
    let validationErrorSerializerStub;
    let replyStub;
    let loggerStub;
    let googleReCaptchaStub;

    beforeEach(() => {
      boomBadRequestMock = sinon.mock(Boom);
      validationErrorSerializerStub = sinon.stub(validationErrorSerializer, 'serialize');
      replyStub = sinon.stub();
      loggerStub = sinon.stub(logger, 'error').returns({});
      googleReCaptchaStub = sinon.stub(googleReCaptcha, 'verify').returns(Promise.resolve());
    });

    afterEach(() => {
      validationErrorSerializerStub.restore();
      boomBadRequestMock.restore();
      loggerStub.restore();
      googleReCaptchaStub.restore();
    });

    describe('when the account is created', () => {

      let userSerializerStub;
      let userSerializerDeserializeStub;
      let mailServiceMock;
      let user;
      let email;

      beforeEach(() => {

        email = faker.internet.email();
        user = new User({
          email
        });

        mailServiceMock = sinon.mock(mailService);
        userSerializerStub = sinon.stub(userSerializer, 'serialize');
        userSerializerDeserializeStub = sinon.stub(userSerializer, 'deserialize').returns({
          save: _ => {
            return Promise.resolve(user);
          }
        });

        replyStub.returns({
          code: _ => {
          }
        });
      });

      afterEach(() => {
        userSerializerDeserializeStub.restore();
        userSerializerStub.restore();
      });

      it('should call validator once', () => {
        googleReCaptchaStub.returns(Promise.reject([]));
        const request = {
          payload: {
            data: {
              attributes: {
                recaptchaToken: 'a-random-token'
              }
            }
          }
        };
        const codeMethodStub = sinon.stub();
        const replyStub = function() {
          return { code: codeMethodStub };
        };

        //when
        const promise = userController.save(request, replyStub);

        return promise.then(() => {
          sinon.assert.calledOnce(googleReCaptchaStub);
        });

      });

      it('should call validator with good parameter', () => {
        googleReCaptchaStub.returns(Promise.reject([]));

        //Given
        const request = {
          payload: {
            data: {
              attributes: {
                'recaptcha-token': 'a-random-token'
              }
            }
          }
        };

        const replyStub = function() {
          return {
            code: _ => {

            }
          };
        };

        const promise = userController.save(request, replyStub);
        const expectedValue = 'a-random-token';
        // Then
        return promise.then(() => {
          sinon.assert.calledWith(googleReCaptchaStub, expectedValue);
        });
      });

      it('should send an email', () => {
        // Given
        const request = {
          payload: {
            data: {
              attributes: {
                firstName: '',
                lastName: '',
                email
              }
            }
          }
        };
        mailServiceMock.expects('sendAccountCreationEmail').once().withArgs(email);

        // When
        const promise = userController.save(request, replyStub);

        // Then
        return promise.then(() => {
          mailServiceMock.verify();
        });
      });

      it('should return a serialized user', () => {
        // Given
        const expectedSerializedUser = { message: 'serialized user' };
        userSerializerStub.returns(expectedSerializedUser);
        const sendAccountCreationEmail = sinon.stub(mailService, 'sendAccountCreationEmail');
        const request = {
          payload: {
            data: {
              attributes: {
                firstName: '',
                lastName: '',
                email
              }
            }
          }
        };

        // When
        const promise = userController.save(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(userSerializerStub, user);
          sinon.assert.calledWith(replyStub, expectedSerializedUser);

          sendAccountCreationEmail.restore();
        });
      });

    });

    it('should reply with a serialized error', () => {
      // Given
      const codeSpy = sinon.spy();
      const expectedSerializedError = { errors: [] };
      validationErrorSerializerStub.withArgs().returns(expectedSerializedError);
      replyStub.returns({ code: codeSpy });

      const request = {
        payload: {
          data: {
            attributes: {
              firstName: '',
              lastName: ''
            }
          }
        }
      };

      // When
      const promise = userController.save(request, replyStub);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedSerializedError);
        sinon.assert.calledOnce(validationErrorSerializerStub);
        sinon.assert.calledWith(codeSpy, 422);
      });
    });

    describe('should return 422 Bad request', () => {

      let userSerializerStub;
      const request = {
        payload: {
          data: {
            attributes: {
              firstName: '',
              lastName: ''
            }
          }
        }
      };

      beforeEach(() => {
        userSerializerStub = sinon.stub(userSerializer, 'deserialize');
        replyStub.returns({ code: sinon.spy() });
      });

      afterEach(() => {
        userSerializerStub.restore();
      });

      describe('when from Sqlite3', () => {

        it('should return an already registered email error message', () => {
          // Given
          validationErrorSerializerStub.withArgs().returns({ errors: [] });
          const sqliteConstraint = { code: 'SQLITE_CONSTRAINT' };
          userSerializerStub.returns({
            save: () => {
              return Promise.reject(sqliteConstraint);
            }
          });

          // When
          const promise = userController.save(request, replyStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledWith(validationErrorSerializerStub, {
              data: {
                email: ['Cette adresse electronique est déjà enregistrée.']
              }
            });
          });
        });

      });

      describe('when from Postgresql', () => {

        it('should return an already registered email error message', () => {
          // Given
          validationErrorSerializerStub.withArgs().returns({ errors: [] });
          const sqliteConstraint = { code: '23505' };
          userSerializerStub.returns({
            save: () => {
              return Promise.reject(sqliteConstraint);
            }
          });

          // When
          const promise = userController.save(request, replyStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledWith(validationErrorSerializerStub, {
              data: {
                email: ['Cette adresse electronique est déjà enregistrée.']
              }
            });
          });
        });

      });

      it('when there is not payload', () => {
        // Given
        const request = {};
        boomBadRequestMock.expects('badRequest').exactly(1);

        // When
        userController.save(request, replyStub);

        // Then
        boomBadRequestMock.verify();
      });

      it('when there is an empty payload', () => {
        // Given
        const request = {
          payload: {}
        };
        boomBadRequestMock.expects('badRequest').exactly(1);

        // When
        userController.save(request, replyStub);

        // Then
        boomBadRequestMock.verify();
      });

      it('when there is an payload with empty data', () => {
        // Given
        const request = {
          payload: {
            data: {}
          }
        };
        boomBadRequestMock.expects('badRequest').exactly(1);

        // When
        userController.save(request, replyStub);

        // Then
        boomBadRequestMock.verify();
      });

      describe('Error cases according to recaptcha', function() {
        const user = new User({
          email: 'shi@fu.me'
        });
        const request = {
          payload: {
            data: {
              attributes: {}
            }
          }
        };

        beforeEach(function() {
          userSerializerStub.returns(user);
          googleReCaptchaStub.rejects(new InvalidRecaptchaTokenError());
        });

        afterEach(function() {
          userSerializerStub.restore();
        });

        it('should return 422 Bad request, when captcha is not valid', () => {
          // given
          const codeMethodSpy = sinon.spy();
          const replyErrorStub = function() {
            return { code: codeMethodSpy };
          };
          // When
          const promise = userController.save(request, replyErrorStub);

          // Then
          return promise.then(() => {
            sinon.assert.calledWith(codeMethodSpy, 422);
          });
        });

        it('should return handle bookshelf model validation, when captcha is not valid', () => {
          // given
          const expectedMergedErrors = {
            errors: [{
              status: '400',
              title: 'Invalid Attribute',
              detail: 'Vous devez cliquer ci-dessous.',
              source: { pointer: '/data/attributes/recaptcha-token' },
              meta: { field: 'recaptchaToken' }
            }, {
              status: '400',
              title: 'Invalid Attribute',
              detail: 'Le champ CGU doit être renseigné.',
              source: { pointer: '/data/attributes/cgu' },
              meta: { field: 'cgu' }
            }]
          };
          const replyErrorStub = sinon.stub();
          replyErrorStub.returns({
            code: () => {
            }
          });

          // When
          const promise = userController.save(request, replyErrorStub);

          // Then
          return promise.catch(() => {
            sinon.assert.calledWith(replyErrorStub, expectedMergedErrors);
          });
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
          id: 7
        },
        payload: {
          data: {
            attributes: {
              password: 'Pix2017!'
            }
          }
        }
      };
      const user = new User({
        id: 7,
        email: 'maryz@acme.xh'
      });
      let codeStub;

      beforeEach(() => {
        sandbox = sinon.sandbox.create();
        sandbox.stub(passwordResetService, 'hasUserAPasswordResetDemandInProgress');
        sandbox.stub(passwordResetService, 'invalidOldResetPasswordDemand');
        sandbox.stub(validationErrorSerializer, 'serialize');
        sandbox.stub(UserRepository, 'updatePassword');
        sandbox.stub(UserRepository, 'findUserById').resolves(user);
        sandbox.stub(encryptionService, 'hashPassword');
        codeStub = sinon.stub();
        reply = sandbox.stub().returns({
          code: () => {
          }
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
          sinon.assert.calledOnce(UserRepository.findUserById);
          sinon.assert.calledWith(UserRepository.findUserById, request.params.id);
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

      it('should update user password with a hashed password', async() => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        const encryptedPassword = '$2a$05$jJnoQ/YCvAChJmYW9AoQXe/k17mx2l2MqJBgXVo/R/ju4HblB2iAe';
        encryptionService.hashPassword.resolves(encryptedPassword);

        // when
        const promise = userController.updatePassword(request, reply);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(UserRepository.updatePassword);
          sinon.assert.calledOnce(encryptionService.hashPassword);
          sinon.assert.calledWith(encryptionService.hashPassword, request.payload.data.attributes.password);
          sinon.assert.calledWith(UserRepository.updatePassword, request.params.id, encryptedPassword);
        });
      });

      it('should invalidate current password reset demand (mark as being used)', () => {
        // given
        passwordResetService.hasUserAPasswordResetDemandInProgress.resolves();
        UserRepository.updatePassword.resolves();
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
        UserRepository.updatePassword.resolves();
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
            code: codeStub
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
        // Given
        const anyErrorFromProfileBuilding = new Error();
        userService.getProfileToCertify.rejects(anyErrorFromProfileBuilding);

        // When
        const promise = userController.getProfileToCertify(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledOnce(replyStub);

          sinon.assert.notCalled(Boom.badRequest);
          sinon.assert.calledOnce(Boom.badImplementation);
          sinon.assert.calledWith(Boom.badImplementation, anyErrorFromProfileBuilding);
        });
      });

      it('should log the error', () => {
        // Given
        const anyErrorFromProfileBuilding = new Error();
        userService.getProfileToCertify.rejects(anyErrorFromProfileBuilding);

        // When
        const promise = userController.getProfileToCertify(request, replyStub);

        // Then
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
        // When
        const promise = userController.getProfileToCertify(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledOnce(userService.getProfileToCertify);
          sinon.assert.calledWith(userService.getProfileToCertify, 1, '1970-01-01T00:00:00.000Z');
        });
      });

      it('should reply the skillProfile', () => {
        // When
        const promise = userController.getProfileToCertify(request, replyStub);

        // Then
        return promise.then(() => {
          sinon.assert.calledWith(replyStub, []);
        });
      });
    });
  });
});
