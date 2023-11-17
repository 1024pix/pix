import { expect, sinon, HttpTestServer } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { serializer as scoOrganizationInvitationSerializer } from '../../../../lib/infrastructure/serializers/jsonapi/sco-organization-invitation-serializer.js';
import * as moduleUnderTest from '../../../../lib/application/organization-invitations/index.js';

import {
  AlreadyExistingInvitationError,
  NotFoundError,
  UserNotFoundError,
  OrganizationWithoutEmailError,
  OrganizationNotFoundError,
  ManyOrganizationsFoundError,
  OrganizationArchivedError,
} from '../../../../lib/domain/errors.js';

describe('Integration | Application | Organization-invitations | organization-invitation-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'acceptOrganizationInvitation');
    sandbox.stub(usecases, 'sendScoInvitation');
    sandbox.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember');
    sandbox.stub(scoOrganizationInvitationSerializer, 'serialize');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#acceptOrganizationInvitation', function () {
    const payload = {
      data: {
        id: '100047_DZWMP7L5UM',
        type: 'organization-invitation-responses',
        attributes: {
          code: 'DZWMP7L5UM',
          email: 'USER@example.net',
        },
      },
    };

    context('Success cases', function () {
      it('should return an HTTP response with status code 204', async function () {
        // given
        usecases.acceptOrganizationInvitation.resolves();
        usecases.createCertificationCenterMembershipForScoOrganizationAdminMember.resolves();

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('Error cases', function () {
      it('should respond an HTTP response with status code 412 when AlreadyExistingInvitationError', async function () {
        // given
        usecases.acceptOrganizationInvitation.rejects(new AlreadyExistingInvitationError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(412);
      });

      it('should respond an HTTP response with status code 404 when NotFoundError', async function () {
        // given
        usecases.acceptOrganizationInvitation.rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async function () {
        // given
        usecases.acceptOrganizationInvitation.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(404);
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
      it('should return an HTTP response with status code 201', async function () {
        // given
        usecases.sendScoInvitation.resolves();

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', function () {
      it('should respond an HTTP response with status code 404 when OrganizationNotFoundError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationNotFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 412 when OrganizationWithoutEmailError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new OrganizationWithoutEmailError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(412);
      });

      it('should respond an HTTP response with status code 409 when ManyOrganizationsFoundError', async function () {
        // given
        usecases.sendScoInvitation.rejects(new ManyOrganizationsFoundError());

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/sco', payload);

        // then
        expect(response.statusCode).to.equal(409);
      });

      it('should respond an HTTP response with status code 422 when OrganizationArchivedError', async function () {
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
