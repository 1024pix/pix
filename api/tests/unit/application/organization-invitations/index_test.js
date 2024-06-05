import * as moduleUnderTest from '../../../../lib/application/organization-invitations/index.js';
import { organizationInvitationController } from '../../../../lib/application/organization-invitations/organization-invitation-controller.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | organization-invitation-router', function () {
  describe('POST /api/organization-invitations/{id}/response', function () {
    it('should exists', async function () {
      // given
      sinon
        .stub(organizationInvitationController, 'acceptOrganizationInvitation')
        .callsFake((request, h) => h.response().code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/organization-invitations/1/response';
      const payload = {
        data: {
          id: '100047_DZWMP7L5UM',
          type: 'organization-invitation-responses',
          attributes: {
            code: 'DZWMP7L5UM',
            email: 'user@example.net',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
