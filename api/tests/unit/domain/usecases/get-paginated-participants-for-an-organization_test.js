const { expect, sinon } = require('../../../test-helper');
const getPaginatedParticipantsForAnOrganization = require('../../../../lib/domain/usecases/get-paginated-participants-for-an-organization');

describe('Unit | UseCase | get-participants-by-organization-id', function () {
  it('should call organizationParticipantRepository', async function () {
    // given
    const organizationId = 90000;
    const page = {};
    const organizationParticipantRepository = {
      getParticipantsByOrganizationId: sinon.stub(),
    };

    // when
    await getPaginatedParticipantsForAnOrganization({
      organizationId,
      page,
      organizationParticipantRepository,
    });

    // then
    expect(organizationParticipantRepository.getParticipantsByOrganizationId).to.have.been.calledWithExactly({
      organizationId,
      page,
    });
  });
});
