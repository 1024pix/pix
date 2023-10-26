import { expect, sinon } from '../../../test-helper.js';
import * as sessionResultsLinkService from '../../../../lib/domain/services/session-results-link-service.js';
import { tokenService } from '../../../../src/shared/domain/services/token-service.js';
import { getI18n } from '../../../tooling/i18n/i18n.js';

describe('Unit | Domain | Service | Session Results Link Service', function () {
  describe('#generateResultsLink', function () {
    it('should return a valid download link', function () {
      // given
      const sessionId = 12345;
      const i18n = getI18n();
      const tokenServiceStub = sinon.stub(tokenService, 'createCertificationResultsLinkToken');
      tokenServiceStub.withArgs({ sessionId, daysBeforeExpiration: 30 }).returns('a_valid_token');

      // when
      const link = sessionResultsLinkService.generateResultsLink({ sessionId, i18n });

      // then
      expect(link).to.deep.equal('https://app.pix.org/api/sessions/download-all-results/a_valid_token?lang=fr');
    });
  });
});
