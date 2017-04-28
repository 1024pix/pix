const { describe, it, before, after, expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const Boom = require('boom');

const faker = require('faker');
const User = require('../../../../lib/domain/models/data/user');

const userController = require('../../../../lib/application/users/user-controller');
const validationErrorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const mailService = require('../../../../lib/domain/services/mail-service');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

describe('Unit | Controller | user-controller', () => {

  let server;

  before(() => {
    server = new Hapi.Server();
    server.connection({ port: null });
    server.register({ register: require('../../../../lib/application/users') });
  });

  describe('#save', () => {

    let boomBadRequestMock;
    let validationErrorSerializerStub;
    let replyStub;

    beforeEach(() => {
      boomBadRequestMock = sinon.mock(Boom);
      validationErrorSerializerStub = sinon.stub(validationErrorSerializer, 'serialize');
      replyStub = sinon.stub();
    });

    afterEach(() => {
      validationErrorSerializerStub.restore();
      boomBadRequestMock.restore();
    });

    describe('when the account is created', () => {

      let userSerializerStub;
      let mailServiceMock;
      let user;
      let email;

      beforeEach(() => {

        email = faker.internet.email();
        user = new User({
          email
        });

        mailServiceMock = sinon.mock(mailService);
        userSerializerStub = sinon.stub(userSerializer, "deserialize").returns({
          save: _ => { return Promise.resolve(user); }
        });

        replyStub.returns({
          code: _ => {}
        })
      });

      afterEach(() => {
        userSerializerStub.restore();
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
        mailServiceMock.expects("sendAccountCreationEmail").once().withArgs(email);

        // When
        let promise = userController.save(request, replyStub);

        // Then
        return promise.then(() => {
          mailServiceMock.verify();
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
      let promise = userController.save(request, replyStub);

      // Then
      return promise.then(() => {
        sinon.assert.calledWith(replyStub, expectedSerializedError);
        sinon.assert.calledOnce(validationErrorSerializerStub);
        sinon.assert.calledWith(codeSpy, 400);
      });
    });

    describe('should return 400 Bad request', () => {

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


    });

  });

});
