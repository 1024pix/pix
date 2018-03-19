const { sinon, expect } = require('../../../test-helper');

const Boom = require('boom');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const User = require('../../../../lib/domain/models/User');

const userController = require('../../../../lib/application/users/user-controller');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const googleReCaptcha = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const logger = require('../../../../lib/infrastructure/logger');

const mailService = require('../../../../lib/domain/services/mail-service');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const passwordResetService = require('../../../../lib/domain/services/reset-password-service');
const encryptionService = require('../../../../lib/domain/services/encryption-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const userService = require('../../../../lib/domain/services/user-service');

const { PasswordResetDemandNotFoundError, InternalError } = require('../../../../lib/domain/errors');
const { InvalidRecaptchaTokenError } = require('../../../../lib/infrastructure/validators/errors');

describe('Unit | Controller | user-controller', () => {

  describe('#save', () => {

    let boomBadRequestMock;

    let replyStub;
    let codeStub;

    let sandbox;
    const email = 'to-be-free@ozone.airplane';
    const savedUser = new User({ email });

    beforeEach(() => {
      sandbox = sinon.sandbox.create();

      boomBadRequestMock = sinon.mock(Boom);

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({
        code: codeStub
      });

      sandbox.stub(logger, 'error').returns({});
      sandbox.stub(googleReCaptcha, 'verify').returns(Promise.resolve());
      sandbox.stub(userSerializer, 'deserialize').returns(new User({}));
      sandbox.stub(userSerializer, 'serialize');
      sandbox.stub(userRepository, 'save').resolves(savedUser);
      sandbox.stub(validationErrorSerializer, 'serialize');
    });

    afterEach(() => {
      boomBadRequestMock.restore();
      sandbox.restore();
    });

    describe('when the account is created', () => {

      let mailServiceMock;

      beforeEach(() => {
        mailServiceMock = sinon.mock(mailService);
      });

      it('should call validator once', () => {
        googleReCaptcha.verify.returns(Promise.reject([]));
        const request = {
          payload: {
            data: {
              attributes: {
                recaptchaToken: 'a-random-token'
              }
            }
          }
        };

        //when
        const promise = userController.save(request, replyStub);

        return promise.then(() => {
          sinon.assert.calledOnce(googleReCaptcha.verify);
        });

      });

      it('should call validator with good parameter', () => {
        //Given
        googleReCaptcha.verify.returns(Promise.reject([]));
        const request = {
          payload: {
            data: {
              attributes: {
                'recaptcha-token': 'a-random-token'
              }
            }
          }
        };

        // when
        const promise = userController.save(request, replyStub);

        // then
        const expectedValue = 'a-random-token';
        return promise.then(() => {
          sinon.assert.calledWith(googleReCaptcha.verify, expectedValue);
        });
      });

      it('should send an email', () => {
        // given
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

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          mailServiceMock.verify();
        });
      });

      it('should return a serialized user', () => {
        // given
        const expectedSerializedUser = { message: 'serialized user' };
        userSerializer.serialize.returns(expectedSerializedUser);
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

        // when
        const promise = userController.save(request, replyStub);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(userSerializer.serialize, savedUser);
          sinon.assert.calledWith(replyStub, expectedSerializedUser);

          sendAccountCreationEmail.restore();
        });
      });

    });

    it('should reply with a serialized error', () => {
      // given
      userRepository.save.rejects();

      const expectedSerializedError = { errors: [] };
      validationErrorSerializer.serialize.returns(expectedSerializedError);

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

      // when
      const promise = userController.save(request, replyStub);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedSerializedError);
        sinon.assert.calledOnce(validationErrorSerializer.serialize);
        sinon.assert.calledWith(codeStub, 422);
      });
    });

    describe('should return 422 Bad request', () => {

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

      describe('when from Sqlite3', () => {

        it('should return an already registered email error message', () => {
          // given
          validationErrorSerializer.serialize.returns({ errors: [] });
          const sqliteConstraint = { code: 'SQLITE_CONSTRAINT' };
          userRepository.save.rejects(sqliteConstraint);

          // when
          const promise = userController.save(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(validationErrorSerializer.serialize, {
              data: {
                email: ['Cette adresse electronique est déjà enregistrée.']
              }
            });
          });
        });

      });

      describe('when from Postgresql', () => {

        it('should return an already registered email error message', () => {
          // given
          validationErrorSerializer.serialize.returns({ errors: [] });

          const sqliteConstraint = { code: '23505' };
          userRepository.save.rejects(sqliteConstraint);

          // when
          const promise = userController.save(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(validationErrorSerializer.serialize, {
              data: {
                email: ['Cette adresse electronique est déjà enregistrée.']
              }
            });
          });
        });

      });

      it('when there is not payload', () => {
        // given
        const request = {};
        boomBadRequestMock.expects('badRequest').exactly(1);

        // when
        userController.save(request, replyStub);

        // then
        boomBadRequestMock.verify();
      });

      it('when there is an empty payload', () => {
        // given
        const request = {
          payload: {}
        };
        boomBadRequestMock.expects('badRequest').exactly(1);

        // when
        userController.save(request, replyStub);

        // then
        boomBadRequestMock.verify();
      });

      it('when there is an payload with empty data', () => {
        // given
        const request = {
          payload: {
            data: {}
          }
        };
        boomBadRequestMock.expects('badRequest').exactly(1);

        // when
        userController.save(request, replyStub);

        // then
        boomBadRequestMock.verify();
      });

      describe('Error cases according to recaptcha', function() {
        const user = new BookshelfUser({
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
          userSerializer.deserialize.returns(user);
          googleReCaptcha.verify.rejects(new InvalidRecaptchaTokenError());
        });

        it('should return 422 Bad request, when captcha is not valid', () => {
          // when
          const promise = userController.save(request, replyStub);

          // then
          return promise.then(() => {
            sinon.assert.calledWith(codeStub, 422);
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

          // when
          const promise = userController.save(request, replyStub);

          // then
          return promise.catch(() => {
            sinon.assert.calledWith(replyStub, expectedMergedErrors);
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
      const user = new BookshelfUser({
        id: 7,
        email: 'maryz@acme.xh'
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

      it('should update user password with a hashed password', async() => {
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
});
