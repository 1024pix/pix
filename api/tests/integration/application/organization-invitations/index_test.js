const {
  expect,
  HttpTestServer,
  sinon,
} = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/organization-invitations/index');

const organisationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');

describe('Integration | Application | Organization-invitations | Routes', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(organisationInvitationController, 'acceptOrganizationInvitation').callsFake((request, h) => h.response().code(204));
    sinon.stub(organisationInvitationController, 'sendScoInvitation').callsFake((request, h) => h.response().code(201));
    sinon.stub(organisationInvitationController, 'getOrganizationInvitation').callsFake((request, h) => h.response().code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/organization-invitations/:id/response', () => {

    const method = 'POST';
    const url = '/api/organization-invitations/1/response';

    it('should return 200 when payload is valid', async () => {
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

    it('should return 400 when payload is missing', async () => {
      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/organization-invitations/sco', () => {

    const method = 'POST';
    const url = '/api/organization-invitations/sco';

    it('should send invitation when payload is valid', async () => {
      // given
      const payload = {
        data: {
          type: 'sco-organization-invitations',
          attributes: {
            uai: '1234567A',
            'first-name': 'john',
            'last-name': 'harry',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should return bad request when payload is not valid', async () => {
      // given
      const payload = {
        data: {
          type: 'sco-organization-invitations',
          attributes: {
            uai: '1234567A',
            lastName: 'harry',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/organization-invitations/:id', () => {

    it('should return 200 when query is valid', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/organization-invitations/1?code=DZWMP7L5UM');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return 400 when query is invalid', async () => {
      // when
      const response = await httpTestServer.request('GET', '/api/organization-invitations/1');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
