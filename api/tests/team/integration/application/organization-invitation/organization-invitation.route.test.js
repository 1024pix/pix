import { organizationInvitationController } from '../../../../../src/team/application/organization-invitations/organization-invitation.controller.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Team | Application | Route | organization-invitations', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(organizationInvitationController, 'sendScoInvitation').callsFake((request, h) => h.response().code(201));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(teamRoutes[0]);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('POST /api/organization-invitations/sco', function () {
    const method = 'POST';
    const url = '/api/organization-invitations/sco';

    it('should send invitation when payload is valid', async function () {
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

    it('should return bad request when payload is not valid', async function () {
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
});
