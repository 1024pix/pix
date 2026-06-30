import sinon from 'sinon';

import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import {
  ManyOrganizationsFoundError,
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
} from '../../../../../src/shared/domain/errors.js';
import { teamRoutes } from '../../../../../src/team/application/routes.js';
import { OrganizationArchivedError } from '../../../../../src/team/domain/errors.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { scoOrganizationInvitationSerializer } from '../../../../../src/team/infrastructure/serializers/jsonapi/sco-organization-invitation.serializer.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

const routesUnderTest = teamRoutes[0];

describe('Integration | Team | Application | Controller | Organization invitations', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'acceptOrganizationInvitation');
    sandbox.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember');
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
