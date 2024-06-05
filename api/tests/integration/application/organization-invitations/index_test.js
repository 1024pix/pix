import * as moduleUnderTest from '../../../../lib/application/organization-invitations/index.js';
import { organizationInvitationController } from '../../../../lib/application/organization-invitations/organization-invitation-controller.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Organization-invitations | Routes', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon
      .stub(organizationInvitationController, 'acceptOrganizationInvitation')
      .callsFake((request, h) => h.response().code(204));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/organization-invitations/:id/response', function () {
    const method = 'POST';
    const url = '/api/organization-invitations/1/response';

    it('should return 200 when payload is valid', async function () {
      // given
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

    it('should return 400 when payload is missing', async function () {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
