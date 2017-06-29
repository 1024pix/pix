const {describe, it, after, afterEach, beforeEach, sinon, expect} = require('../../../test-helper');

const faker = require('faker');
const User = require('../../../../lib/domain/models/data/user');
const Boom = require('boom');

const server = require('../../../../server');

const userController = require('../../../../lib/application/users/user-controller');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');
const googleReCaptcha = require('../../../../lib/infrastructure/validators/grecaptcha-validator');
const {InvalidRecaptchaTokenError} = require('../../../../lib/infrastructure/validators/errors');
const logger = require('../../../../lib/infrastructure/logger');

const mailService = require('../../../../lib/domain/services/mail-service');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

describe('Unit | Controller | user-controller', () => {

  after((done) => {
    server.stop(done);
  });

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
          return {code: codeMethodStub};
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

      it('should send an email', () => {
        // Given
        const expectedSerializedUser = {message: 'serialized user'};
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
      const expectedSerializedError = {errors: []};
      validationErrorSerializerStub.withArgs().returns(expectedSerializedError);
      replyStub.returns({code: codeSpy});

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
        replyStub.returns({code: sinon.spy()});
      });

      afterEach(() => {
        userSerializerStub.restore();
      });

      describe('when from Sqlite3', () => {

        it('should return an already registered email error message', () => {
          // Given
          validationErrorSerializerStub.withArgs().returns({errors: []});
          const sqliteConstraint = {code: 'SQLITE_CONSTRAINT'};
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
          validationErrorSerializerStub.withArgs().returns({errors: []});
          const sqliteConstraint = {code: '23505'};
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
            return {code: codeMethodSpy};
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
              source: {pointer: '/data/attributes/recaptcha-token'},
              meta: {field: 'recaptchaToken'}
            },
            {
              status: '400',
              title: 'Invalid Attribute',
              detail: 'Le champ CGU doit être renseigné.',
              source: {pointer: '/data/attributes/cgu'},
              meta: {field: 'cgu'}
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

  describe('#getProfile', () => {
    it('should be a function', function() {
      // then
      expect(userController.getProfile).to.be.a('function');
    });
  });
});
