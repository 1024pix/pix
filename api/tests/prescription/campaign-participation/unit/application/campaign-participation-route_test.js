import sinon from 'sinon';

import { campaignParticipationController } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-controller.js';
import { campaignParticipationRoute as moduleUnderTest } from '../../../../../src/prescription/campaign-participation/application/campaign-participation-route.js';
import { campaignParticipationPreHandlers } from '../../../../../src/prescription/campaign-participation/application/pre-handlers.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Application | Router | campaign-participation-router ', function () {
  describe('GET /api/users/{userId}/campaigns/{campaignId}/assessment-result', function () {
    const method = 'GET';

    it('returns 200', async function () {
      // given
      sinon.stub(campaignParticipationController, 'getUserCampaignAssessmentResult').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser')
        .callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/users/12/campaigns/34/assessment-result';

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
      const url = `/api/users/${userId}/campaigns/34/assessment-result`;

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
      const url = `/api/users/12/campaigns/${campaignId}/assessment-result`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });

    describe('when pre handler throws', function () {
      it('should not call controller', async function () {
        // given
        const getCampaignAssessmentParticipationResultStub = sinon.stub(
          campaignParticipationController,
          'getCampaignAssessmentParticipationResult',
        );
        const organizationAccessStub = sinon.stub(securityPreHandlers, 'checkOrganizationAccess').throws();
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/campaigns/1/assessment-participations/1/results');

        // then
        expect(organizationAccessStub.called).to.be.true;
        expect(getCampaignAssessmentParticipationResultStub.called).to.be.false;
      });
    });
  });

  describe('GET /api/campaign-participations/{campaignParticipationId}/level-per-tubes-and-competences', function () {
    let getLevelPerTubesAndCompetencesStub,
      checkUserCanAccessCampaignParticipationStub,
      checkOrganizationAccessStub,
      httpTestServer;

    beforeEach(async function () {
      getLevelPerTubesAndCompetencesStub = sinon.stub(
        campaignParticipationController,
        'getLevelPerTubesAndCompetences',
      );

      checkUserCanAccessCampaignParticipationStub = sinon.stub(
        campaignParticipationPreHandlers,
        'checkUserCanAccessCampaignParticipation',
      );

      checkOrganizationAccessStub = sinon.stub(securityPreHandlers, 'checkOrganizationAccess');

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    it('should call security pre handler before controller', async function () {
      // given
      checkUserCanAccessCampaignParticipationStub.callsFake((request, h) => h.response(true));
      checkOrganizationAccessStub.callsFake((request, h) => h.response(true));
      getLevelPerTubesAndCompetencesStub.resolves(true);

      // when
      const request = await httpTestServer.request(
        'GET',
        '/api/campaign-participations/2/level-per-tubes-and-competences',
      );

      // then
      sinon.assert.callOrder(
        checkUserCanAccessCampaignParticipationStub,
        checkOrganizationAccessStub,
        getLevelPerTubesAndCompetencesStub,
      );
      expect(request.result).equal(true);
    });

    it('should not call any function if params is not an integer', async function () {
      // when
      await httpTestServer.request(
        'GET',
        '/api/campaign-participations/I_AM_NOT_AN_INTEGER/level-per-tubes-and-competences',
      );

      // then
      expect(checkUserCanAccessCampaignParticipationStub.called).false;
      expect(checkOrganizationAccessStub.called).false;
      expect(getLevelPerTubesAndCompetencesStub.called).false;
    });
  });

  describe('GET /api/campaigns/{campaignId}/profiles-collection-participations/{campaignParticipationId}', function () {
    describe('when pre handler throws', function () {
      it('should not call controller', async function () {
        // given
        const getCampaignProfileStub = sinon.stub(campaignParticipationController, 'getCampaignProfile');
        const organizationAccessStub = sinon.stub(securityPreHandlers, 'checkOrganizationAccess').throws();
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        await httpTestServer.request('GET', '/api/campaigns/1/profiles-collection-participations/2');

        // then
        expect(organizationAccessStub.called).to.be.true;
        expect(getCampaignProfileStub.called).to.be.false;
      });
    });
  });

  describe('PATCH /api/admin/campaign-participations/{campaignParticipationId}', function () {
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
    it('should call the required pre handler', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkAuthorizationToManageCampaign').callsFake((request, h) => h.response(true));
      sinon
        .stub(securityPreHandlers, 'checkCampaignBelongsToCombinedCourse')
        .callsFake((request, h) => h.response(true));
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
      expect(securityPreHandlers.checkAuthorizationToManageCampaign.called).true;
      expect(securityPreHandlers.checkCampaignBelongsToCombinedCourse.called).true;
      expect(response.statusCode).to.equal(204);
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

  describe('DELETE /api/admin/campaigns/{campaignId}/campaign-participations/{campaignParticipationId}', function () {
    it('should call required pre handler', async function () {
      // given
      const superAdminStub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
      const hasRoleSupportStub = sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport');
      sinon.stub(securityPreHandlers, 'checkCampaignBelongsToCombinedCourse').returns(() => true);
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([superAdminStub, hasRoleSupportStub])
        .returns(() => true);
      sinon.stub(campaignParticipationController, 'deleteParticipation').resolves('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('DELETE', '/api/admin/campaigns/1/campaign-participations/2');

      // then
      expect(securityPreHandlers.hasAtLeastOneAccessOf.calledOnce, 'hasAtLeastOnAccessOf').true;
      expect(
        securityPreHandlers.checkCampaignBelongsToCombinedCourse.calledOnce,
        'checkCampaignBelongsToCombinedCourse',
      ).true;
      expect(campaignParticipationController.deleteParticipation.calledOnce, 'deleteParticipation').true;
      expect(response.statusCode).to.equal(200);
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

  describe('GET /api/users/{userId}/campaigns/{campaignId}/campaign-participations', function () {
    const method = 'GET';

    it('returns 400 when userId is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const userId = 'wrongId';
      const url = `/api/users/${userId}/campaigns/34/campaign-participations`;

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
      const url = `/api/users/12/campaigns/${campaignId}/campaign-participations`;

      // when
      const result = await httpTestServer.request(method, url);

      // then
      expect(result.statusCode).to.equal(400);
    });
  });

  describe('GET /api/organizations/{organizationId}/participation-statistics', function () {
    const method = 'GET';

    it('should throw 403 if user is not admin in organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) =>
        h
          .response({ errors: new Error('forbidden') })
          .code(403)
          .takeover(),
      );

      const organizationPlacesStatisticsStub = sinon.stub(
        campaignParticipationController,
        'getParticipationStatistics',
      );

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organizations/1/participation-statistics';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(403);
      expect(organizationPlacesStatisticsStub.called).to.be.false;
    });

    it('should call prehandlers before calling controller method', async function () {
      // given
      sinon
        .stub(campaignParticipationController, 'getParticipationStatistics')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organizations/1/participation-statistics';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(securityPreHandlers.checkUserBelongsToOrganization).to.have.been.calledBefore(
        campaignParticipationController.getParticipationStatistics,
      );
    });
  });

  describe('GET /api/campaigns/{campaignId}/assessment-participations/{campaignParticipationId}', function () {
    const method = 'GET';

    context('when campaignId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // given
        const getCampaignAssessmentParticipationStub = sinon.stub(
          campaignParticipationController,
          'getCampaignAssessmentParticipation',
        );

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        // when
        const response = await httpTestServer.request(method, '/api/campaigns/FAKE_ID/assessment-participations/1');

        // then
        expect(getCampaignAssessmentParticipationStub.called).false;
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when campaignParticipationId is not an integer', function () {
      it('should return 400 - Bad request', async function () {
        // given
        const getCampaignAssessmentParticipationStub = sinon.stub(
          campaignParticipationController,
          'getCampaignAssessmentParticipation',
        );

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/FAKE_ID');

        // then
        expect(getCampaignAssessmentParticipationStub.called).false;
        expect(response.statusCode).to.equal(400);
      });
    });

    it('should called right security prehandler', async function () {
      // given
      const checkUserCanAccessCampaignParticipationStub = sinon
        .stub(campaignParticipationPreHandlers, 'checkUserCanAccessCampaignParticipation')
        .callsFake((request, h) => h.response(true));
      const getCampaignAssessmentParticipationStub = sinon
        .stub(campaignParticipationController, 'getCampaignAssessmentParticipation')
        .resolves(true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request(method, '/api/campaigns/1/assessment-participations/1');

      // then
      expect(checkUserCanAccessCampaignParticipationStub.called).true;
      expect(getCampaignAssessmentParticipationStub.called).true;
    });
  });
});
