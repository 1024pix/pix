const { expect, sinon, hFake } = require('../../test-helper');
const controllerReplies = require('../../../lib/infrastructure/controller-replies');
const errorSerializer = require('../../../lib/infrastructure/serializers/jsonapi/error-serializer');
const infraErrors = require('../../../lib/infrastructure/errors');
const logger = require('../../../lib/infrastructure/logger');

describe('Unit | Infrastructure | ControllerReplies', () => {

  describe('#controllerReplies', () => {

    beforeEach(() => {
      sinon.stub(errorSerializer, 'serialize');
      sinon.stub(logger, 'error');
    });

    context('noContent', () => {

      let response;

      beforeEach(() => {
        // when
        response = controllerReplies(hFake).noContent();
      });

      it('should return reply with payload and 201', () => {
        // then
        expect(response.source).to.deep.equal();
        expect(response.statusCode).to.equal(204);
      });
    });

    context('error', () => {

      let response;
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
          response = controllerReplies(hFake).error(error);
        });

        it('should call the infrastructure error serializer to serialize the error', () => {
          // then
          expect(errorSerializer.serialize).to.have.been.calledWith(error);
        });
        it('should return reply with serialized error and status code from error', () => {
          // then
          expect(response.source).to.deep.equal(serializedError);
          expect(response.statusCode).to.equal(409);
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
          response = controllerReplies(hFake).error(error);
        });

        it('should call the infrastructure error serializer to serialize the newly created infra error', () => {
          // then
          expect(errorSerializer.serialize.args[0][0]).to.be.an.instanceOf(infraErrors.InfrastructureError);
          expect(errorSerializer.serialize.args[0][0].message).to.equal(errorMessage);
        });
        it('should log the unexpectedError', () => {
          // then
          expect(logger.error).to.have.been.calledWith(error);
        });
        it('should return reply with serialized error and status code from error', () => {
          // then
          expect(response.source).to.deep.equal(serializedError);
          expect(response.statusCode).to.equal(500);
        });
      });
    });
  });
});
