const { expect, sinon } = require('../../../test-helper');
const findPaginatedFilteredScoParticipants = require('../../../../lib/domain/usecases/find-paginated-filtered-sco-participants');

describe('Unit | UseCase | findPaginatedFilteredScoParticipants', function () {
  let scoOrganizationParticipantRepository;
  const organizationId = 1;
  const userId = 2;
  const username = 'username';
  const email = 'email@example.net';
  const isAuthenticatedFromGAR = true;

  const expectedScoParticipantsNotYetReconciled = { id: 3 };
  const expectedReconciledScoParticipantsWithUsername = { id: 4, userId, username };
  const expectedReconciledScoParticipantsWithEmail = { id: 5, userId, email };
  const expectedReconciledScoParticipantsFromGAR = { id: 5, userId, isAuthenticatedFromGAR };
  let foundScoParticipants;
  const expectedScoParticipants = {
    data: [
      expectedScoParticipantsNotYetReconciled,
      expectedReconciledScoParticipantsWithUsername,
      expectedReconciledScoParticipantsWithEmail,
      expectedReconciledScoParticipantsFromGAR,
    ],
  };

  beforeEach(function () {
    scoOrganizationParticipantRepository = {
      findPaginatedFilteredScoParticipants: sinon.stub().returns(expectedScoParticipants),
    };
  });

  it('should fetch sco participants matching organization', async function () {
    foundScoParticipants = await findPaginatedFilteredScoParticipants({
      organizationId,
      filter: { division: '4A', search: 'A' },
      sort: { participationCount: 'asc' },
      page: { size: 10, number: 1 },
      scoOrganizationParticipantRepository,
    });

    expect(scoOrganizationParticipantRepository.findPaginatedFilteredScoParticipants).to.have.been.calledWithExactly({
      organizationId,
      filter: { division: '4A', search: 'A' },
      sort: { participationCount: 'asc' },
      page: { size: 10, number: 1 },
    });
    expect(foundScoParticipants).to.deep.equal(expectedScoParticipants);
  });
});
