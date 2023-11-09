import { expect, sinon, HttpTestServer } from '../../../test-helper.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { organizationController } from '../../../../lib/application/organizations/organization-controller.js';
import * as moduleUnderTest from '../../../../lib/application/organizations/index.js';

describe('Integration | Application | Organizations | Routes', function () {
  describe('POST /api/admin/organizations', function () {
    it('should exist', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/organizations';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'create').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/admin/organizations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('Error cases', function () {
      context('when user is not allowed to access resource', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          const method = 'GET';
          const url = '/api/admin/organizations';

          sinon
            .stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf')
            .returns((request, h) => h.response().code(403).takeover());
          sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('POST /api/admin/organizations/:id/archive', function () {
    it('should call the controller to archive the organization', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/organizations/1/archive';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'archiveOrganization').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(204);
      expect(organizationController.archiveOrganization).to.have.been.calledOnce;
    });
  });

  describe('GET /api/admin/organizations/:id/places', function () {
    it('should call the controller to archive the organization', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/places';

      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(organizationController, 'findOrganizationPlacesLot')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findOrganizationPlacesLot).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/admin/organizations/{id}/places/{placeId}', function () {
    context('when user is not allowed to access resource', function () {
      it('should resolve a 403 HTTP response', async function () {
        // given
        const method = 'DELETE';
        const url = '/api/admin/organizations/1/places/2';

        sinon.stub(organizationController, 'findOrganizationPlacesLot');
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }));
        sinon
          .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
          .callsFake((request, h) => h.response({ errors: new Error('forbidden') }));

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(organizationController.findOrganizationPlacesLot).to.not.have.been.called;
        expect(securityPreHandlers.checkAdminMemberHasRoleSuperAdmin).to.have.been.called;
        expect(securityPreHandlers.checkAdminMemberHasRoleMetier).to.have.been.called;
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/organizations/:id/invitations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/invitations';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'findPendingInvitations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPendingInvitations).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/admin/organizations/:organizationId/invitations/:organizationInvitationId', function () {
    it('should return an HTTP status code 204', async function () {
      // given
      const method = 'DELETE';
      const url = '/api/admin/organizations/1/invitations/1';

      sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(organizationController, 'cancelOrganizationInvitation')
        .returns((request, h) => h.response().code(204));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(204);
      expect(organizationController.cancelOrganizationInvitation).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id/campaigns', function () {
    it('should call the organization controller to get the campaigns', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/campaigns';

      sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'findPaginatedFilteredCampaigns').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPaginatedFilteredCampaigns).to.have.been.calledOnce;
    });
  });

  describe('POST /api/organizations/:id/invitations', function () {
    it('should call the organization controller to send invitations', async function () {
      // given
      const method = 'POST';
      const url = '/api/organizations/1/invitations';
      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'member@organization.org',
          },
        },
      };

      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organizationController.sendInvitations).to.have.been.calledOnce;
    });
  });

  describe('GET /api/organizations/:id/invitations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/invitations';

      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(organizationController, 'findPendingInvitations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.findPendingInvitations).to.have.been.calledOnce;
    });
  });
});
