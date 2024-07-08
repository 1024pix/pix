import * as moduleUnderTest from '../../../../lib/application/organizations/index.js';
import { organizationController } from '../../../../lib/application/organizations/organization-controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Organizations | Routes', function () {
  describe('POST /api/admin/organizations', function () {
    it('should exist', async function () {
      // given
      const method = 'POST';
      const url = '/api/admin/organizations';

      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
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

      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
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
            .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
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

      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
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

  describe('GET /api/admin/organizations/:id/invitations', function () {
    it('should exist', async function () {
      // given
      const method = 'GET';
      const url = '/api/admin/organizations/1/invitations';

      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
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
