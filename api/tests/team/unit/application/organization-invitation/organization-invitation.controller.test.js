import { MissingQueryParamError } from '../../../../../lib/application/http-errors.js';
import { organizationInvitationController } from '../../../../../src/team/application/organization-invitations/organization-invitation.controller.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { catchErr, domainBuilder, expect, hFake, sinon } from '../../../../../tests/test-helper.js';

describe('Unit | Team | Application | Controller | organization-invitation', function () {
  describe('#getOrganizationInvitation', function () {
    it('calls the usecase to get invitation with organizationInvitationId, organizationInvitationCode', async function () {
      // given
      const organizationInvitationId = 1;
      const organizationInvitationCode = 'ABCDEFGH01';
      const request = {
        params: { id: organizationInvitationId },
        query: { code: organizationInvitationCode },
      };

      sinon.stub(usecases, 'getOrganizationInvitation').resolves();
      const organizationInvitationSerializer = {
        serialize: sinon.stub().returns(),
      };

      // when
      await organizationInvitationController.getOrganizationInvitation(request, hFake, {
        organizationInvitationSerializer,
      });

      // then
      expect(usecases.getOrganizationInvitation).to.have.been.calledWithExactly({
        organizationInvitationId,
        organizationInvitationCode,
      });
    });

    it('throws a MissingQueryParamError when code is not defined', async function () {
      // given
      const organizationInvitationId = 1;
      const request = {
        params: { id: organizationInvitationId },
        query: { code: undefined },
      };

      // when
      const errorCatched = await catchErr(organizationInvitationController.getOrganizationInvitation)(request);

      // then
      expect(errorCatched).to.be.instanceof(MissingQueryParamError);
    });
  });

  describe('#findPendingInvitations', function () {
    const userId = 1;
    let organization;
    const resolvedOrganizationInvitations = 'organization invitations';
    const serializedOrganizationInvitations = 'serialized organization invitations';

    let request;
    let dependencies;

    beforeEach(function () {
      organization = domainBuilder.buildOrganization();
      request = {
        auth: { credentials: { userId } },
        params: { id: organization.id },
      };

      sinon.stub(usecases, 'findPendingOrganizationInvitations');

      const organizationInvitationSerializerStub = {
        serialize: sinon.stub(),
      };

      dependencies = {
        organizationInvitationSerializer: organizationInvitationSerializerStub,
      };
    });

    it('calls the usecase to find pending invitations with organizationId', async function () {
      usecases.findPendingOrganizationInvitations.resolves(resolvedOrganizationInvitations);
      dependencies.organizationInvitationSerializer.serialize.resolves(serializedOrganizationInvitations);

      // when
      const response = await organizationInvitationController.findPendingInvitations(request, hFake, dependencies);

      // then
      expect(usecases.findPendingOrganizationInvitations).to.have.been.calledWithExactly({
        organizationId: organization.id,
      });
      expect(dependencies.organizationInvitationSerializer.serialize).to.have.been.calledWithExactly(
        resolvedOrganizationInvitations,
      );
      expect(response).to.deep.equal(serializedOrganizationInvitations);
    });
  });

  describe('#cancelOrganizationInvitation', function () {
    it('calls the use case to cancel invitation with organizationInvitationId', async function () {
      //given
      const organizationInvitationId = 123;

      const request = {
        auth: { credentials: { userId: 1 } },
        params: { organizationInvitationId },
      };
      const cancelledOrganizationInvitation = domainBuilder.buildOrganizationInvitation({
        id: organizationInvitationId,
        status: OrganizationInvitation.StatusType.CANCELLED,
      });

      sinon
        .stub(usecases, 'cancelOrganizationInvitation')
        .withArgs({
          organizationInvitationId: cancelledOrganizationInvitation.id,
        })
        .resolves(cancelledOrganizationInvitation);

      // when
      const response = await organizationInvitationController.cancelOrganizationInvitation(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#sendInvitations', function () {
    let request;

    const userId = 1;
    let invitation;
    let organizationId;
    let emails;
    const locale = 'fr-fr';

    beforeEach(function () {
      invitation = domainBuilder.buildOrganizationInvitation();
      organizationId = invitation.organizationId;
      emails = [invitation.email];
      request = {
        auth: { credentials: { userId } },
        params: { id: organizationId },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: invitation.email,
            },
          },
        },
      };
    });

    it('should call the usecase to create invitation with organizationId, email and locale', async function () {
      sinon.stub(usecases, 'createOrganizationInvitations').resolves([{ id: 1 }]);

      // when
      await organizationInvitationController.sendInvitations(request, hFake);

      // then
      expect(usecases.createOrganizationInvitations).to.have.been.calledWithExactly({
        organizationId,
        emails,
        locale,
      });
    });
  });
});
