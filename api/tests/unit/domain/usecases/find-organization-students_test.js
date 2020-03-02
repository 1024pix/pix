const { expect, sinon } = require('../../../test-helper');
const findOrganizationStudents = require('../../../../lib/domain/usecases/find-organization-students');

describe('Unit | UseCase | find-organization-students', () => {

  // Given
  const organizationId = 1;
  const userId = 2;
  const username = 'username';
  const email = 'email@example.net';
  const samlId = 'samlId';
  const isAuthenticatedFromGAR = true;
  const user = { username, email , samlId };

  const studentNotYetReconcilied = { id: 3 };
  const studentReconcilied = { id: 4, userId };
  const expectedReconciliedStudentFromGAR = { ...studentReconcilied, ...{ username, email, isAuthenticatedFromGAR } };

  let res;
  const students = [studentNotYetReconcilied, studentReconcilied, ];
  const userRepository = { get: sinon.stub().withArgs(userId).returns(user) };
  const studentRepository = { findByOrganizationId: sinon.stub().withArgs({ organizationId }).returns(students) };

  // When
  before(async function() {
    res = await findOrganizationStudents({ organizationId, studentRepository, userRepository });
  });

  // Then
  it('should fetch students matching organization', function() {
    expect(studentRepository.findByOrganizationId).to.have.been.calledWithExactly({ organizationId });
  });

  it('should return reconcilied and not reconcilied students', function() {
    expect(res).to.deep.equal([studentNotYetReconcilied, studentReconcilied]);
  });

  context('The student is reconcilied', () => {

    it('should fetch the user if the student is reconcilied', function() {
      expect(userRepository.get).to.have.been.calledWithExactly(studentReconcilied.userId);
    });

    it('should add user{username} to student if authenticated by username', function() {
      expect(res).to.deep.equal([studentNotYetReconcilied, expectedReconciliedStudentFromGAR]);
    });

    it('should add user{email} to student if authenticated by email', function() {
      expect(res).to.deep.equal([studentNotYetReconcilied, expectedReconciliedStudentFromGAR]);
    });

    it('should add user{isAuthenticatedFromGAR} to student if authenticated from GAR', function() {
      expect(res).to.deep.equal([studentNotYetReconcilied, expectedReconciliedStudentFromGAR]);
    });

  });

  context('The student is not reconcilied yet', () => {

    it('should not fetch the user if the student is not reconcilied', function() {
      expect(userRepository.get).to.have.been.calledOnce;
    });
  });

});

