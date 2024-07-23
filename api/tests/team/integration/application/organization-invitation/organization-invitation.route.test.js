import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { organizationInvitationController } from '../../../../../src/team/application/organization-invitations/organization-invitation.controller.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Team | Application | Route | organization-invitations', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(organizationInvitationController, 'sendScoInvitation').callsFake((request, h) => h.response().code(201));
    sinon
      .stub(organizationInvitationController, 'getOrganizationInvitation')
      .callsFake((request, h) => h.response().code(200));

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(teamRoutes[0]);
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('GET /api/organization-invitations/:id', function () {
    it('returns 200 when query is valid', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/organization-invitations/1?code=DZWMP7L5UM');

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('returns 400 when query is invalid', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/organization-invitations/1');

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/organization-invitations/sco', function () {
    const method = 'POST';
    const url = '/api/organization-invitations/sco';

    it('sends invitation when payload is valid', async function () {
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

    it('returns bad request when payload is not valid', async function () {
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
      sinon.stub(organizationInvitationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(teamRoutes[0]);

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
      expect(organizationInvitationController.sendInvitations).to.have.been.calledOnce;
    });
  });
});
