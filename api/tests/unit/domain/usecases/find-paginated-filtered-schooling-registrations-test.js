const { expect, sinon } = require('../../../test-helper');
const findPaginatedFilteredSchoolingRegistrations = require('../../../../lib/domain/usecases/find-paginated-filtered-schooling-registrations');

describe('Unit | UseCase | findPaginatedFilteredSchoolingRegistrations', () => {

  const organizationId = 1;
  const userId = 2;
  const username = 'username';
  const email = 'email@example.net';
  const isAuthenticatedFromGAR = true;

  const expectedSchoolingRegistrationNotYetReconciled = { id: 3 };
  const expectedReconciledSchoolingRegistrationWithUsername = { id: 4, userId , username };
  const expectedReconciledSchoolingRegistrationWithEmail = { id: 5, userId , email };
  const expectedReconciledSchoolingRegistrationFromGAR = { id: 5, userId , isAuthenticatedFromGAR };
  let foundOrganizationSchoolingRegistrations;
  const expectedSchoolingRegistrations = { 
    data: [
      expectedSchoolingRegistrationNotYetReconciled,
      expectedReconciledSchoolingRegistrationWithUsername,
      expectedReconciledSchoolingRegistrationWithEmail,
      expectedReconciledSchoolingRegistrationFromGAR
    ]
  };
  const schoolingRegistrationRepository = { findPaginatedFilteredSchoolingRegistrations: sinon.stub().returns(expectedSchoolingRegistrations) };

  it('should fetch students matching organization', async function() {
    foundOrganizationSchoolingRegistrations = await findPaginatedFilteredSchoolingRegistrations({
      organizationId,
      filter: { lastName: 'A' },
      page: { size: 10, number: 1 },
      schoolingRegistrationRepository
    });

    expect(schoolingRegistrationRepository.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledWithExactly({
      organizationId,
      filter: { lastName: 'A' },
      page: { size: 10, number: 1 },
    });
    expect(foundOrganizationSchoolingRegistrations).to.deep.equal(expectedSchoolingRegistrations);
  });
});

