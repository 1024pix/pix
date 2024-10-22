import { learnerParticipationController } from '../../../../..//src/prescription/campaign-participation/application/learner-participation-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign-participation/application/learner-participation-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | campaign-participation-router ', function () {
  describe('POST /api/campaign-participations', function () {
    it('should return 200 when participant have external id', async function () {
      // given
      sinon.stub(learnerParticipationController, 'save').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const participantExternalId = 'toto';
      const response = await httpTestServer.request('POST', '/api/campaign-participations', {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': participantExternalId,
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 when participant external id exceeds 255 characters', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const participantExternalId256Characters =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      const response = await httpTestServer.request('POST', '/api/campaign-participations', {
        data: {
          type: 'campaign-participations',
          attributes: {
            'participant-external-id': participantExternalId256Characters,
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/users/{userId}/campaigns/{campaignId}/profile', function () {
    const method = 'GET';

    it('returns 200', async function () {
      // given
      sinon.stub(learnerParticipationController, 'getSharedCampaignParticipationProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/profile';

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(200);
    });

    it('returns 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    it('returns 400 when campaignId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const campaignId = 'wrongId';
      const url = `/api/users/12/campaigns/${campaignId}/profile`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });
});
