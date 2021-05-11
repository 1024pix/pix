const { expect, sinon, hFake } = require('../../test-helper');

const logger = require('../../../lib/infrastructure/logger');
const config = require('../../../lib/config');
const errorManager = require('../../../lib/application/error-manager');
const { BaseHttpError } = require('../../../lib/application/http-errors');
const { handleDomainAndHttpErrors } = require('../../../lib/application/pre-response-utils');

const { DomainError } = require('../../../lib/domain/errors');

describe('Unit | Application | PreResponse-utils', () => {

  describe('#handleDomainAndHttpErrors', () => {

    beforeEach(() => {
      sinon.stub(errorManager, 'handle').resolves();
    });

    it('should continue the process when not DomainError or BaseHttpError', async () => {
      // given
      const request = {
        response: {
          statusCode: 200,
        },
      };
      const expectedString = 'Symbol(continue)';

      // when
      const response = await handleDomainAndHttpErrors(request, hFake);

      // then
      expect(typeof response).to.be.equal('symbol');
      expect(response.toString()).to.be.equal(expectedString);
    });

    it('should manage DomainError', async () => {
      const request = {
        response: new DomainError('Error message'),
      };

      // when
      await handleDomainAndHttpErrors(request, hFake);

      // then
      expect(errorManager.handle).to.have.been.calledWithExactly(request, hFake, request.response);
    });

    it('should manage BaseHttpError', async () => {
      const request = {
        response: new BaseHttpError('Error message'),
      };

      // when
      await handleDomainAndHttpErrors(request, hFake);

      // then
      expect(errorManager.handle).to.have.been.calledWithExactly(request, hFake, request.response);
    });

    context('when dealing with 5XX errors', () => {
      context('when 5XX error logging is enabled', () => {
        it('logs 5XX errors', () => {
          // given
          const response = _create500ErrorResponse();
          const request = { response };

          sinon.stub(logger, 'error');
          sinon.stub(config.logging, 'shouldLog5XXErrors').value(true);

          // when
          handleDomainAndHttpErrors(request, hFake);

          // then
          expect(logger.error).to.have.been.calledWith(response);
        });
      });

      context('when 5XX error logging is disabled', () => {
        it('skips 5XX errors logging', () => {
          // given
          const response = _create500ErrorResponse();
          const request = { response };

          sinon.stub(logger, 'error');
          sinon.stub(config.logging, 'shouldLog5XXErrors').value(false);

          // when
          handleDomainAndHttpErrors(request, hFake);

          // then
          expect(logger.error).not.to.have.been.calledWith(response);
        });
      });
    });
  });

});

function _create500ErrorResponse() {
  return {
    isBoom: true,
    output: { statusCode: 500 },
  };
}
