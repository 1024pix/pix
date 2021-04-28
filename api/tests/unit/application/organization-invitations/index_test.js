const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/organization-invitations');

const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');

describe('Unit | Router | organization-invitation-router', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(organizationInvitationController, 'acceptOrganizationInvitation').callsFake((request, h) => h.response().code(204));
    sinon.stub(organizationInvitationController, 'getOrganizationInvitation').callsFake((request, h) => h.response().code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('POST /api/organization-invitations/{id}/response', () => {

    it('should exists', async () => {
      // given
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

  describe('GET /api/organization-invitations/{id}', () => {

    const method = 'GET';

    it('should exists', async () => {
      // given
      const url = '/api/organization-invitations/1?code=DZWMP7L5UM';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return Bad Request Error when invitation identifier is not a number', async () => {
      // given
      const url = '/api/organization-invitations/XXXXXXXXXXXXXXXX15812?code=DZWMP7L5UM';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
