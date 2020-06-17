const { expect, sinon } = require('../../../test-helper');
const findUserWithSchoolingRegistrations = require('../../../../lib/domain/usecases/find-user-with-schooling-registrations');

describe('Unit | UseCase | findUserWithSchoolingRegistrations', () => {

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
  const expectedSchoolingRegistrations = [expectedSchoolingRegistrationNotYetReconciled, expectedReconciledSchoolingRegistrationWithUsername, expectedReconciledSchoolingRegistrationWithEmail ,expectedReconciledSchoolingRegistrationFromGAR ];
  const schoolingRegistrationRepository = { findUserWithSchoolingRegistrationsByOrganizationId: sinon.stub().returns(expectedSchoolingRegistrations) };

  it('should fetch students matching organization', async function() {
    foundOrganizationSchoolingRegistrations = await findUserWithSchoolingRegistrations({ organizationId, filter: { lastName: 'A' }, schoolingRegistrationRepository });

    expect(schoolingRegistrationRepository.findUserWithSchoolingRegistrationsByOrganizationId).to.have.been.calledWithExactly({ organizationId, filter: { lastName: 'A' } });
    expect(foundOrganizationSchoolingRegistrations).to.deep.equal(expectedSchoolingRegistrations);
  });
});

