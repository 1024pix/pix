import sinon from 'sinon';

import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { organizationInvitationController } from '../../../../../src/team/application/organization-invitations/organization-invitation.controller.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Team | Application | Route | Admin | organization-invitations', function () {
  describe('GET /api/admin/organizations/{id}/invitations', function () {
    it('returns an HTTP status code 200', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/invitations';

      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationInvitationController, 'findPendingInvitations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationInvitationController.findPendingInvitations).to.have.been.calledOnce;
    });
  });

  describe('POST /api/organization-invitations/{id}/response', function () {
    const method = 'POST';
    const url = '/api/organization-invitations/1/response';
    let httpTestServer;

    beforeEach(async function () {
      sinon
        .stub(organizationInvitationController, 'acceptOrganizationInvitation')
        .callsFake((request, h) => h.response().code(204));

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);
    });

    describe('when user has a valid payload', function () {
      it('returns 204', async function () {
        // given
        const payload = {
          data: {
            id: '100047_DZWMP7L5UM',
            type: 'organization-invitation-responses',
            attributes: {
              code: 'DZWMP7L5UM',
              'user-id': 123,
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    it('should return 400 when payload is missing', async function () {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns 400 when payload violates required userId constraint', async function () {
      // given
      const payload = {
        data: {
          id: '100047_DZWMP7L5UM',
          type: 'organization-invitation-responses',
          attributes: {
            code: 'DZWMP7L5UM',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('"data.attributes.user-id" is required');
    });
  });

  describe('DELETE /api/admin/organizations/:organizationId/invitations/:organizationInvitationId', function () {
    it('returns an HTTP status code 204', async function () {
      // given
      const method = 'DELETE';
      const url = '/api/admin/organizations/1/invitations/1';

      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(organizationInvitationController, 'cancelOrganizationInvitation')
        .returns((request, h) => h.response().code(204));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      // when
      const { statusCode } = await httpTestServer.request(method, url);

      // then
      expect(statusCode).to.equal(204);
      expect(organizationInvitationController.cancelOrganizationInvitation).to.have.been.calledOnce;
    });
  });

  describe('POST /api/admin/organizations/{id}/invitations', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/1/invitations';

    it('should return HTTP code 201', async function () {
      // given
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(organizationInvitationController, 'sendInvitationByLocaleAndRole')
        .callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            locale: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should reject request with HTTP code 400, when email is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: '',
            locale: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when input is not a email', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'azerty',
            locale: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when locale is unknown', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            locale: 'pt',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('returns forbidden access if admin member has CERTIF role', async function () {
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

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            locale: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
