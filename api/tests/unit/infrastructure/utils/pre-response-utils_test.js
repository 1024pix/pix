const { expect, sinon, hFake } = require('../../../test-helper');

const errorManager = require('../../../../lib/infrastructure/utils/error-manager');

const { DomainError } = require('../../../../lib/domain/errors');
const { InfrastructureError } = require('../../../../lib/application/errors');

const { catchDomainAndInfrastructureErrors } = require('../../../../lib/infrastructure/utils/pre-response-utils');

describe('Unit | Infrastructure | Utils | PreResponse-utils', () => {

  describe('#catchDomainAndInfrastructureErrors', () => {

    beforeEach(() => {
      sinon.stub(errorManager, 'send').resolves();
    });

    it('should continue the process when not DomainError or InfrastructureError', async () => {
      // given
      const request = {
        response: {
          statusCode: 200
        }
      };
      const expectedString = 'Symbol(continue)';

      // when
      const response = await catchDomainAndInfrastructureErrors(request, hFake);

      // then
      expect(typeof response).to.be.equal('symbol');
      expect(response.toString()).to.be.equal(expectedString);
    });

    it('should manage DomainError', async () => {
      const request = {
        response: new DomainError('Error message')
      };

      // when
      await catchDomainAndInfrastructureErrors(request, hFake);

      // then
      expect(errorManager.send).to.have.been.calledWithExactly(hFake, request.response);
    });

    it('should manage InfrastructureError', async () => {
      const request = {
        response: new InfrastructureError('Error message')
      };

      // when
      await catchDomainAndInfrastructureErrors(request, hFake);

      // then
      expect(errorManager.send).to.have.been.calledWithExactly(hFake, request.response);
    });
  });

});
