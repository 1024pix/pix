const { expect, sinon } = require('../../../test-helper');
const findOrganizationStudentWithUserInfo = require('../../../../lib/domain/usecases/find-organization-students-with-users-infos');

describe('Unit | UseCase | findStudentsWithUserInfoByOrganizationId', () => {

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
  const schoolingRegistrationRepository = { findSchoolingRegistrationsWithUserInfoByOrganizationId: sinon.stub().withArgs({ organizationId }).returns(expectedSchoolingRegistrations) };

  before(async function() {
    foundOrganizationSchoolingRegistrations = await findOrganizationStudentWithUserInfo({ organizationId, schoolingRegistrationRepository });
  });

  it('should fetch students matching organization', function() {
    expect(schoolingRegistrationRepository.findSchoolingRegistrationsWithUserInfoByOrganizationId).to.have.been.calledWithExactly({ organizationId });
  });

  it('should return reconcilied and not reconcilied students', function() {
    expect(foundOrganizationSchoolingRegistrations).to.deep.equal(expectedSchoolingRegistrations);
  });

});

