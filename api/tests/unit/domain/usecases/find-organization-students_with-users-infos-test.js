const { expect, sinon } = require('../../../test-helper');
const findOrganizationStudentWithUserInfo = require('../../../../lib/domain/usecases/find-organization-students-with-users-infos');

describe('Unit | UseCase | findStudentsWithUserInfoByOrganizationId', () => {

  const organizationId = 1;
  const userId = 2;
  const username = 'username';
  const email = 'email@example.net';
  const isAuthenticatedFromGAR = true;

  const expectedStudentNotYetReconciled = { id: 3 };
  const expectedReconciledStudentWithUsername = { id: 4, userId , username };
  const expectedReconciledStudentWithEmail = { id: 5, userId , email };
  const expectedReconciledStudentFromGAR = { id: 5, userId , isAuthenticatedFromGAR };
  let foundOrganizationStudents;
  const expectedStudents = [expectedStudentNotYetReconciled, expectedReconciledStudentWithUsername, expectedReconciledStudentWithEmail ,expectedReconciledStudentFromGAR ];
  const studentRepository = { findStudentsWithUserInfoByOrganizationId: sinon.stub().withArgs({ organizationId }).returns(expectedStudents) };

  before(async function() {
    foundOrganizationStudents = await findOrganizationStudentWithUserInfo({ organizationId, studentRepository });
  });

  it('should fetch students matching organization', function() {
    expect(studentRepository.findStudentsWithUserInfoByOrganizationId).to.have.been.calledWithExactly({ organizationId });
  });

  it('should return reconcilied and not reconcilied students', function() {
    expect(foundOrganizationStudents).to.deep.equal(expectedStudents);
  });

});

