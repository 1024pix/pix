import * as moduleUnderTest from '../../../../lib/application/organization-invitations/index.js';
import { AlreadyExistingInvitationError, NotFoundError } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { UserNotFoundError } from '../../../../src/shared/domain/errors.js';
import { usecases as srcUsecases } from '../../../../src/team/domain/usecases/index.js';
import { serializer as scoOrganizationInvitationSerializer } from '../../../../src/team/infrastructure/serializers/jsonapi/sco-organization-invitation.serializer.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Organization-invitations | organization-invitation-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'acceptOrganizationInvitation');
    sandbox.stub(srcUsecases, 'createCertificationCenterMembershipForScoOrganizationAdminMember');
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
        srcUsecases.createCertificationCenterMembershipForScoOrganizationAdminMember.resolves();

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
});
