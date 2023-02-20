import { expect, HttpTestServer, sinon } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/organization-invitations';
import organizationInvitationController from '../../../../lib/application/organization-invitations/organization-invitation-controller';

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

  describe('GET /api/organization-invitations/{id}', function () {
    const method = 'GET';

    it('should exists', async function () {
      // given
      sinon
        .stub(organizationInvitationController, 'getOrganizationInvitation')
        .callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-invitations/1?code=DZWMP7L5UM';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return Bad Request Error when invitation identifier is not a number', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const url = '/api/organization-invitations/XXXXXXXXXXXXXXXX15812?code=DZWMP7L5UM';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
