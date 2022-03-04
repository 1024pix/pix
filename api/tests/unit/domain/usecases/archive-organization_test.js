const { expect, sinon, domainBuilder } = require('../../../test-helper');
const archiveOrganization = require('../../../../lib/domain/usecases/archive-organization');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

describe('Unit | UseCase | archive-organization', function () {
  let organizationInvitationRepository;

  beforeEach(function () {
    organizationInvitationRepository = {
      findPendingByOrganizationId: sinon.stub(),
      markAsCancelled: sinon.stub(),
    };
  });

  context('when organization has pending invitations', function () {
    it('should cancel every invitation and update modification date', async function () {
      // given
      const status = OrganizationInvitation.StatusType.PENDING;
      const organizationId = 1;
      const organizationInvitations = [
        domainBuilder.buildOrganizationInvitation({ id: 1, status, organizationId }),
        domainBuilder.buildOrganizationInvitation({ id: 2, status, organizationId }),
        domainBuilder.buildOrganizationInvitation({ id: 3, status, organizationId }),
      ];

      organizationInvitationRepository.findPendingByOrganizationId.resolves(organizationInvitations);

      // when
      await archiveOrganization({
        organizationId,
        organizationInvitationRepository,
      });

      // then
      expect(organizationInvitationRepository.markAsCancelled).to.have.been.calledThrice;
      expect(organizationInvitationRepository.markAsCancelled).to.have.been.calledWith({
        id: 1,
      });
      expect(organizationInvitationRepository.markAsCancelled).to.have.been.calledWith({
        id: 2,
      });
      expect(organizationInvitationRepository.markAsCancelled).to.have.been.calledWith({
        id: 3,
      });
    });
  });
});
