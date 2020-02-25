const { expect, sinon } = require('../../../test-helper');
const findOrganizationStudents = require('../../../../lib/domain/usecases/find-organization-students');

describe('Unit | UseCase | find-organization-students', () => {

  // Given
  const organizationId = 1;
  const userId = 2;
  const username = 'username';
  const user = { username };

  const studentNotYetReconcilied = { id: 3 };
  const studentReconcilied = { id: 4, userId };
  const studentReconciliedWithUserInformations = { ...studentReconcilied, ...{ username }  };

  let res;
  const students = [studentNotYetReconcilied, studentReconcilied ];
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

  it('should fetch the user if the student is reconcilied', function() {
    expect(userRepository.get).to.have.been.calledWithExactly(studentReconcilied.userId);
  });

  it('should not fetch the user if the student is not reconcilied', function() {
    expect(userRepository.get).to.have.been.calledOnce;
  });

  it('should return reconcilied and not reconcilied students', function() {
    expect(res).to.deep.equal([studentNotYetReconcilied, studentReconciliedWithUserInformations ]);
  });

});

