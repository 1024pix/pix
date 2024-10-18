import * as moduleUnderTest from '../../../../src/quest/application/index.js';
import { questController } from '../../../../src/quest/application/quest-controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Quest | Unit | Router | quest-router', function () {
  describe('GET /api/campaign-participations/{campaignParticipationId}/quest-results', function () {
    it('should call checkCampaignParticipationBelongsToUser prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkCampaignParticipationBelongsToUser').returns(() => true);
      sinon.stub(questController, 'getQuestResults').callsFake((request, h) => h.response());

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignParticipationId = 123;

      // when
      await httpTestServer.request('GET', `/api/campaign-participations/${campaignParticipationId}/quest-results`);

      // then
      expect(securityPreHandlers.checkCampaignParticipationBelongsToUser).to.have.been.called;
    });
  });
});
