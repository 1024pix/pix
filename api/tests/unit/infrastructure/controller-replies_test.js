const { expect, sinon } = require('../../test-helper');
const controllerReplies = require('../../../lib/infrastructure/controller-replies');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/error-serializer');
const infraErrors = require('../../../lib/infrastructure/errors');
const logger = require('../../../lib/infrastructure/logger');

describe('Unit | Infrastructure | ControllerReplies', () => {

  describe('#controllerReplies', () => {

    let sandbox;
    let replyStub;
    let codeStub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(errorSerializer, 'serialize');
      sandbox.stub(logger, 'error');

      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({
        code: codeStub,
      });
      codeStub.resolves();
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('ok', () => {

      let payload;
      let promise;

      beforeEach(() => {
        // given
        payload = { data: 'stuff' };

        // when
        promise = controllerReplies(replyStub).ok(payload);
      });

      it('should succeed', () => {
        // then
        return expect(promise).to.be.fulfilled;
      });
      it('should return reply with payload and 200', () => {
        // then
        promise.then(() => {
          expect(replyStub).to.have.been.calledWith(payload);
          expect(codeStub).to.have.been.calledWith(200);
        });
      });
    });

    context('created', () => {

      let payload;
      let promise;

      beforeEach(() => {
        // given
        payload = { data: 'stuff' };

        // when
        promise = controllerReplies(replyStub).created(payload);
      });

      it('should succeed', () => {
        // then
        return expect(promise).to.be.fulfilled;
      });
      it('should return reply with payload and 201', () => {
        // then
        return promise.then(() => {
          expect(replyStub).to.have.been.calledWith(payload);
          expect(codeStub).to.have.been.calledWith(201);
        });
      });
    });

    context('error', () => {

      let promise;
      let error;
      let serializedError;

      context('when error is an infrastructure error', () => {

        beforeEach(() => {
          // given
          error = new infraErrors.ConflictError();
          serializedError = {
            code: '409',
            title: 'Conflict',
            detail: 'Conflict between request and server state.',
          };
          errorSerializer.serialize.returns(serializedError);

          // when
          promise = controllerReplies(replyStub).error(error);
        });

        it('should succeed', () => {
          // then
          return expect(promise).to.be.fulfilled;
        });
        it('should call the infrastructure error serializer to serialize the error', () => {
          // then
          return promise.then(() => {
            expect(errorSerializer.serialize).to.have.been.calledWith(error);
          });
        });
        it('should return reply with serialized error and status code from error', () => {
          // then
          return promise.then(() => {
            expect(replyStub).to.have.been.calledWith(serializedError);
            expect(codeStub).to.have.been.calledWith(409);
          });
        });
      });

      context('when error is not an infrastructure error', () => {

        const errorMessage = 'error message';

        beforeEach(() => {
          // given
          error = new Error(errorMessage);
          serializedError = {
            code: '500',
            title: 'Internal Server Error',
            detail: errorMessage,
          };
          errorSerializer.serialize.returns(serializedError);

          // when
          promise = controllerReplies(replyStub).error(error);
        });

        it('should succeed', () => {
          // then
          return expect(promise).to.be.fulfilled;
        });
        it('should call the infrastructure error serializer to serialize the newly created infra error', () => {
          // then
          return promise.then(() => {
            expect(errorSerializer.serialize.args[0][0]).to.be.an.instanceOf(infraErrors.InfrastructureError);
            expect(errorSerializer.serialize.args[0][0].message).to.equal(errorMessage);
          });
        });
        it('should log the unexpectedError', () => {
          // then
          return promise.then(() => {
            expect(logger.error).to.have.been.calledWith(error);
          });
        });
        it('should return reply with serialized error and status code from error', () => {
          // then
          return promise.then(() => {
            expect(replyStub).to.have.been.calledWith(serializedError);
            expect(codeStub).to.have.been.calledWith(500);
          });
        });
      });
    });
  });
});
