import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { membershipController } from '../../../../../src/team/application/membership/membership.controller.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Application | Route | Membership', function () {
  describe('PATCH /api/memberships/{id}', function () {
    it('should return 200 if user is admin in organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').callsFake((request, h) => h.response(true));
      sinon.stub(membershipController, 'update').callsFake((request, h) => h.response().code(200));

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);
      const membershipId = 123;

      // when
      const response = await httpTestServer.request('PATCH', `/api/memberships/${membershipId}`);

      // then
      expect(response.statusCode).to.equal(200);
      expect(membershipController.update).to.have.been.called;
    });

    it('should return 403 if user is not admin in organization', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserIsAdminInOrganization')
        .callsFake((request, h) => h.response().code(403).takeover());
      sinon.stub(membershipController, 'update');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes);
      const id = 123;

      // when
      const response = await httpTestServer.request('PATCH', `/api/memberships/${id}`);

      // then
      expect(response.statusCode).to.equal(403);
      expect(membershipController.update).to.have.not.been.called;
    });
  });
});
