import sinon from 'sinon';

import { questController } from '../../../../src/quest/application/quest-controller.js';
import { questRoute as moduleUnderTest } from '../../../../src/quest/application/quest-route.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

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

  describe('POST /api/admin/check-user-quest', function () {
    it('should call checkAdminMemberHasRoleSuperAdmin prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').returns(() => true);
      sinon.stub(questController, 'checkUserQuest').callsFake((request, h) => h.response());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      // when
      await httpTestServer.request('POST', `/api/admin/check-user-quest`, {
        data: { attributes: { 'user-id': 1234, 'quest-id': 1 } },
      });
      // then
      sinon.assert.called(questController.checkUserQuest);
      expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.called;
    });
  });
});
