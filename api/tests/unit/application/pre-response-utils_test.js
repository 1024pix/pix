import { expect, sinon, hFake } from '../../test-helper';
import errorManager from '../../../lib/application/error-manager';
import { BaseHttpError } from '../../../lib/application/http-errors';
import { handleDomainAndHttpErrors } from '../../../lib/application/pre-response-utils';
import { DomainError } from '../../../lib/domain/errors';

describe('Unit | Application | PreResponse-utils', function () {
  describe('#handleDomainAndHttpErrors', function () {
    beforeEach(function () {
      sinon.stub(errorManager, 'handle').resolves();
    });

    it('should continue the process when not DomainError or BaseHttpError', async function () {
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

    it('should manage DomainError', async function () {
      const request = {
        response: new DomainError('Error message'),
      };

      // when
      await handleDomainAndHttpErrors(request, hFake);

      // then
      expect(errorManager.handle).to.have.been.calledWithExactly(request, hFake, request.response);
    });

    it('should manage BaseHttpError', async function () {
      const request = {
        response: new BaseHttpError('Error message'),
      };

      // when
      await handleDomainAndHttpErrors(request, hFake);

      // then
      expect(errorManager.handle).to.have.been.calledWithExactly(request, hFake, request.response);
    });
  });
});
