import { expect, sinon } from '../../../test-helper';
import getPaginatedParticipantsForAnOrganization from '../../../../lib/domain/usecases/get-paginated-participants-for-an-organization';

describe('Unit | UseCase | get-participants-by-organization-id', function () {
  it('should call organizationParticipantRepository', async function () {
    // given
    const organizationId = 90000;
    const page = {};
    const sort = { participationCount: 'asc' };
    const organizationParticipantRepository = {
      getParticipantsByOrganizationId: sinon.stub(),
    };
    const filters = {
      fullName: 'name',
    };

    // when
    await getPaginatedParticipantsForAnOrganization({
      organizationId,
      filters,
      page,
      sort,
      organizationParticipantRepository,
    });

    // then
    expect(organizationParticipantRepository.getParticipantsByOrganizationId).to.have.been.calledWithExactly({
      organizationId,
      page,
      sort,
      filters,
    });
  });
});
