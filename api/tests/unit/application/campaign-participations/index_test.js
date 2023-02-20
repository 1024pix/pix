import { expect, HttpTestServer, sinon } from '../../../test-helper';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';
import moduleUnderTest from '../../../../lib/application/campaign-participations';
import campaignParticipationController from '../../../../lib/application/campaign-participations/campaign-participation-controller';

describe('Unit | Application | Router | campaign-participation-router ', function () {
  describe('POST /api/campaign-participations', function () {
    it('should return 200 when participant have external id', async function () {
      // given
      sinon.stub(campaignParticipationController, 'save').callsFake((request, h) => h.response('ok').code(200));
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
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(campaignParticipationController, 'deleteCampaignParticipationForAdmin').resolves('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/campaign-participations/2');

      // then
      sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
      sinon.assert.calledOnce(campaignParticipationController.deleteCampaignParticipationForAdmin);
      expect(response.statusCode).to.equal(200);
    });

    it('should return an HTTP status code 403', async function () {
      // given
      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns((request, h) =>
        h
          .response({ errors: new Error('') })
          .code(403)
          .takeover()
      );
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/campaign-participations/2');

      // then
      sinon.assert.calledOnce(securityPreHandlers.adminMemberHasAtLeastOneAccessOf);
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/campaign-participations/{id}/trainings', function () {
    it('should return an HTTP status code 200', async function () {
      // given
      sinon.stub(campaignParticipationController, 'findTrainings').resolves('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/campaign-participations/2/trainings');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
