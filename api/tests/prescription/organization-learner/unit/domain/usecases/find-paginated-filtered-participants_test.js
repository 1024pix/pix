import { sinon, expect } from '../../../../../test-helper.js';
import { findPaginatedFilteredParticipants } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-paginated-filtered-participants.js';

describe('Unit | UseCases | get-paginated-participants-for-an-organization', function () {
  it('should call organizationParticipantRepository', async function () {
    // given
    const organizationId = 90000;
    const page = {};
    const sort = { participationCount: 'asc' };
    const organizationParticipantRepository = {
      findPaginatedFilteredParticipants: sinon.stub(),
    };
    const filters = {
      fullName: 'name',
    };

    // when
    await findPaginatedFilteredParticipants({
      organizationId,
      filters,
      page,
      sort,
      organizationParticipantRepository,
    });

    // then
    expect(organizationParticipantRepository.findPaginatedFilteredParticipants).to.have.been.calledWithExactly({
      organizationId,
      page,
      sort,
      filters,
    });
  });
});
