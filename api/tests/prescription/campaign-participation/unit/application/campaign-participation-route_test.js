import { campaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-controller.js';
import * as moduleUnderTest from '../../../../../src/prescription/campaign-participation/application/campaign-participation-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | campaign-participation-router ', function () {
  describe('PATCH /api/admin/campaign-participations/{id}', function () {
    it('returns 200 when admin member has rights', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      sinon
        .stub(campaignParticipationController, 'updateParticipantExternalId')
        .callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('PATCH', '/api/admin/campaign-participations/123', {
        data: {
          attributes: {
            'participant-external-id': 'new ext id',
          },
        },
      });

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('returns forbidden when admin member does not have rights', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleCertif').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(campaignParticipationController, 'updateParticipantExternalId')
        .callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PATCH';
      const payload = {
        data: {
          attributes: {
            'participant-external-id': 'new ext id',
          },
        },
      };
      const url = '/api/admin/campaign-participations/123';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('DELETE /api/campaigns/{campaignId}/campaign-participations/{campaignParticipationId}', function () {
    it('should return the controller response', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAuthorizationToManageCampaign').callsFake((request, h) => h.response(true));
      sinon
        .stub(campaignParticipationController, 'deleteParticipation')
        .callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'DELETE';
      const url = '/api/campaigns/4/campaign-participations/123';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(204);
    });

    context('When the user is neither an admin nor the owner of the campaign', function () {
      it('should return 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkAuthorizationToManageCampaign')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'DELETE';
        const url = '/api/campaigns/1/campaign-participations/123';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('When the campaignId is not a number', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'DELETE';
        const url = '/api/campaigns/ERTYU/campaign-participations/123';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('When the campaignParticipationId is not a number', function () {
      it('should return 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'DELETE';
        const url = '/api/campaigns/12/campaign-participations/ERTYUI';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('DELETE /api/admin/campaign-participations/{id}', function () {
    it('should return an HTTP status code 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(campaignParticipationController, 'deleteCampaignParticipationForAdmin').resolves('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/campaign-participations/2');

      // then
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
      sinon.assert.calledOnce(campaignParticipationController.deleteCampaignParticipationForAdmin);
      expect(response.statusCode).to.equal(200);
    });

    it('should return an HTTP status code 403', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) =>
        h
          .response({ errors: new Error('') })
          .code(403)
          .takeover(),
      );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/campaign-participations/2');

      // then
      sinon.assert.calledOnce(securityPreHandlers.hasAtLeastOneAccessOf);
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/admin/campaigns/{id}/participations', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(campaignParticipationController, 'findPaginatedParticipationsForCampaignManagement')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/1/participations');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 with an invalid campaign id', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/invalid/participations');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return 403 when unauthorized', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .returns((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/admin/campaigns/1/participations');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/campaigns/{campaignId}/organization-learners/{organizationLearnerId}/participations', function () {
    it('should call expected prehandler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAuthorizationToAccessCampaign').callsFake((request, h) => h.response('ok'));
      sinon.stub(campaignParticipationController, 'getCampaignParticipationsForOrganizationLearner').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('GET', '/api/campaigns/2/organization-learners/1/participations');

      // then
      expect(securityPreHandlers.checkAuthorizationToAccessCampaign.called).to.be.true;
    });
  });
});
