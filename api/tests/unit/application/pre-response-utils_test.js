const { expect, sinon, hFake } = require('../../test-helper');
const errorManager = require('../../../lib/application/error-manager');
const { BaseHttpError } = require('../../../lib/application/http-errors');
const { handleErrors } = require('../../../lib/application/pre-response-utils');
const monitoringTools = require('../../../lib/infrastructure/monitoring-tools');

const { DomainError } = require('../../../lib/domain/errors');

describe('Unit | Application | PreResponse-utils', function () {
  describe('#handleErrors', function () {
    beforeEach(function () {
      sinon.stub(errorManager, 'handle').resolves();
    });

    context('when the response is not an error', function () {
      it('should return given status code', async function () {
        // given
        const request = {
          response: {
            statusCode: 200,
          },
        };
        const expectedString = 'Symbol(continue)';

        // when
        const response = await handleErrors(request, hFake);

        // then
        expect(typeof response).to.be.equal('symbol');
        expect(response.toString()).to.be.equal(expectedString);
      });
    });

    context('when the response is an error', function () {
      context('when the error is expected', function () {
        it('should manage DomainError', async function () {
          const request = {
            response: new DomainError('Error message'),
          };

          // when
          await handleErrors(request, hFake);

          // then
          expect(errorManager.handle).to.have.been.calledWithExactly(request, hFake, request.response);
        });
        it('should manage BaseHttpError', async function () {
          const request = {
            response: new BaseHttpError('Error message'),
          };

          // when
          await handleErrors(request, hFake);

          // then
          expect(errorManager.handle).to.have.been.calledWithExactly(request, hFake, request.response);
        });
      });
      context('when the error is unexpected', function () {
        it('should call monitoringTools.logError with stacktrace', async function () {
          // given
          const stub = sinon.stub(monitoringTools, 'logError');
          monitoringTools.logError.resolves();
          const request = {
            response: new Error('foo'),
          };

          // when
          await handleErrors(request, hFake);

          // then
          expect(stub).to.have.been.calledOnce;
          const callArguments = stub.firstCall.args[0];
          expect(callArguments.event).to.equal('uncaught-error');
          expect(callArguments.stack.startsWith('Error: foo')).to.be.true;
        });
      });
    });
  });
});
