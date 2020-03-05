const { expect, sinon, hFake } = require('../../test-helper');

const errorManager = require('../../../lib/application/error-manager');
const { HttpError } = require('../../../lib/application/http-errors');
const { handleDomainAndHttpErrors } = require('../../../lib/application/pre-response-utils');

const { DomainError } = require('../../../lib/domain/errors');

describe('Unit | Application | PreResponse-utils', () => {

  describe('#handleDomainAndHttpErrors', () => {

    beforeEach(() => {
      sinon.stub(errorManager, 'handle').resolves();
    });

    it('should continue the process when not DomainError or HttpError', async () => {
      // given
      const request = {
        response: {
          statusCode: 200
        }
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
        response: new DomainError('Error message')
      };

      // when
      await handleDomainAndHttpErrors(request, hFake);

      // then
      expect(errorManager.handle).to.have.been.calledWithExactly(hFake, request.response);
    });

    it('should manage HttpError', async () => {
      const request = {
        response: new HttpError('Error message')
      };

      // when
      await handleDomainAndHttpErrors(request, hFake);

      // then
      expect(errorManager.handle).to.have.been.calledWithExactly(hFake, request.response);
    });
  });

});
