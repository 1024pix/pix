import { sinon, expect } from '../../../../../test-helper.js';
import { getPaginatedParticipantsForAnOrganization } from '../../../../../../src/prescription/learner-list/domain/usecases/get-paginated-participants-for-an-organization.js';

describe('Unit | UseCases | get-paginated-participants-for-an-organization', function () {
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
