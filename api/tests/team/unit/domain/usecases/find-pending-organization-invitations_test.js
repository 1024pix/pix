import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { findPendingOrganizationInvitations } from '../../../../../src/team/domain/usecases/find-pending-organization-invitations.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | UseCase | find-pending-organization-invitations', function () {
  it('succeeds', async function () {
    // given
    const organizationId = 1234;
    const organizationInvitationRepositoryStub = { findPendingByOrganizationId: sinon.stub() };
    organizationInvitationRepositoryStub.findPendingByOrganizationId.resolves();

    // when
    await findPendingOrganizationInvitations({
      organizationId,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
    });

    // then
    expect(organizationInvitationRepositoryStub.findPendingByOrganizationId).to.have.been.calledWithExactly({
      organizationId,
    });
  });

  it('returns the OrganizationInvitations belonging to the given organization', async function () {
    // given
    const organizationId = 1234;
    const foundOrganizationInvitations = [
      domainBuilder.buildOrganizationInvitation({ organizationId, status: OrganizationInvitation.StatusType.PENDING }),
      domainBuilder.buildOrganizationInvitation({ organizationId, status: OrganizationInvitation.StatusType.PENDING }),
    ];
    const organizationInvitationRepositoryStub = {
      findPendingByOrganizationId: sinon.stub().resolves(foundOrganizationInvitations),
    };

    // when
    const organizationInvitations = await findPendingOrganizationInvitations({
      organizationId,
      organizationInvitationRepository: organizationInvitationRepositoryStub,
    });

    // then
    expect(organizationInvitations).to.deep.equal(foundOrganizationInvitations);
    expect(organizationInvitations[0]).to.be.an.instanceOf(OrganizationInvitation);
  });
});
