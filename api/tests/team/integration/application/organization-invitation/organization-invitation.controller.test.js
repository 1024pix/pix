import {
  ManyOrganizationsFoundError,
  OrganizationArchivedError,
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
} from '../../../../../lib/domain/errors.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { serializer as scoOrganizationInvitationSerializer } from '../../../../../src/team/infrastructure/serializers/jsonapi/sco-organization-invitation.serializer.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../../test-helper.js';

const routesUnderTest = teamRoutes[0];

describe('Integration | Team | Application | Controller | Organization invitations', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'sendScoInvitation');
    sandbox.stub(usecases, 'findPendingOrganizationInvitations');
    sandbox.stub(scoOrganizationInvitationSerializer, 'serialize');
    sandbox.stub(securityPreHandlers, 'checkUserIsAdminInOrganization');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(routesUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#findPendingInvitations', function () {
    context('Success cases', function () {
      it('returns an HTTP response with status code 200', async function () {
        // given
        const invitation = domainBuilder.buildOrganizationInvitation({
          organizationId: 1,
          status: OrganizationInvitation.StatusType.PENDING,
        });
        usecases.findPendingOrganizationInvitations.resolves([invitation]);
        securityPreHandlers.checkUserIsAdminInOrganization.returns(true);

        // when
        const response = await httpTestServer.request('GET', '/api/organizations/1/invitations');

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('#sendScoInvitation', function () {
    const uai = '1234567A';
    const payload = {
      data: {
        type: 'sco-organization-invitations',
        attributes: {
          uai,
          'first-name': 'john',
          'last-name': 'harry',
        },
      },
    };

    context('Success cases', function () {
      it('returns an HTTP response with status code 201', async function () {
        // given
        usecases.sendScoInvitation.resolves();

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', function () {
      it('responds an HTTP response with status code 404 when OrganizationNotFoundError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationNotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('responds an HTTP response with status code 412 when OrganizationWithoutEmailError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationWithoutEmailError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(412);
      });

      it('responds an HTTP response with status code 409 when ManyOrganizationsFoundError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new ManyOrganizationsFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(409);
      });

      it('responds an HTTP response with status code 422 when OrganizationArchivedError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationArchivedError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
