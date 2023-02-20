import { expect, sinon } from '../../../test-helper';
import sessionResultsLinkService from '../../../../lib/domain/services/session-results-link-service';
import tokenService from '../../../../lib/domain/services/token-service';

describe('Unit | Domain | Service | Session Results Link Service', function () {
  describe('#generateResultsLink', function () {
    it('should return a valid download link', function () {
      // given
      const tokenServiceStub = sinon.stub(tokenService, 'createCertificationResultsLinkToken');
      tokenServiceStub.withArgs({ sessionId: 12345, daysBeforeExpiration: 30 }).returns('a_valid_token');

      // when
      const link = sessionResultsLinkService.generateResultsLink(12345);

      // then
      expect(link).to.deep.equal('https://app.pix.org/api/sessions/download-all-results/a_valid_token');
    });
  });
});
