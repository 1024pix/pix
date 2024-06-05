import { organizationInvitationController } from '../../../../../src/team/application/organization-invitations/organization-invitation.controller.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
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
});
