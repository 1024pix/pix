import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { organizationInvitationController } from '../../../../../src/team/application/organization-invitations/organization-invitation.controller.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Application | Route | organization-invitation', function () {
  describe('GET /api/organization-invitations/{id}', function () {
    const method = 'GET';

    it('exists', async function () {
      // given
      sinon
        .stub(organizationInvitationController, 'getOrganizationInvitation')
        .callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      const url = '/api/organization-invitations/1?code=DZWMP7L5UM';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('returns Bad Request Error when invitation identifier is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      const url = '/api/organization-invitations/XXXXXXXXXXXXXXXX15812?code=DZWMP7L5UM';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/organizations/{id}/invitations', function () {
    it('returns an empty list when no invitation is found', async function () {
      // given
      sinon.stub(usecases, 'findPendingOrganizationInvitations').resolves([]);
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      // when
      const response = await httpTestServer.request('GET', '/api/organizations/1/invitations');

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([]);
    });
  });

  describe('DELETE /api/organizations/{id}/invitations/{invitationId}', function () {
    it('calls the cancel organization invitation controller', async function () {
      // given
      sinon
        .stub(organizationInvitationController, 'cancelOrganizationInvitation')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      const method = 'DELETE';
      const url = '/api/organizations/1/invitations/1';

      // when
      await httpTestServer.request(method, url);

      // then
      expect(securityPreHandlers.checkUserIsAdminInOrganization).to.have.be.called;
      expect(organizationInvitationController.cancelOrganizationInvitation).to.have.been.calledOnce;
    });
  });
});
