import { MissingQueryParamError } from '../../../../../lib/application/http-errors.js';
import { organizationInvitationController } from '../../../../../src/team/application/organization-invitations/organization-invitation.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { catchErr, expect, hFake, sinon } from '../../../../../tests/test-helper.js';

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
});
