const { expect, sinon } = require('../../../test-helper');
const findPaginatedFilteredSupParticipants = require('../../../../lib/domain/usecases/find-paginated-filtered-sup-participants');

describe('Unit | UseCase | findPaginatedFilteredSupParticipants', function () {
  let supOrganizationParticipantRepository;
  const organizationId = 1;

  let foundSupParticipants;
  const expectedSupParticipants = {
    data: [{ id: 3 }],
  };

  beforeEach(function () {
    supOrganizationParticipantRepository = {
      findPaginatedFilteredSupParticipants: sinon.stub().returns(expectedSupParticipants),
    };
  });

  it('should fetch sup participants matching organization', async function () {
    foundSupParticipants = await findPaginatedFilteredSupParticipants({
      organizationId,
      filter: { search: 'Arm', group: 'L1' },
      sort: { participationCount: 'asc' },
      page: { size: 10, number: 1 },
      supOrganizationParticipantRepository,
    });

    expect(supOrganizationParticipantRepository.findPaginatedFilteredSupParticipants).to.have.been.calledWithExactly({
      organizationId,
      filter: { search: 'Arm', group: 'L1' },
      sort: { participationCount: 'asc' },
      page: { size: 10, number: 1 },
    });
    expect(foundSupParticipants).to.deep.equal(expectedSupParticipants);
  });
});
