const { expect, sinon } = require('../../../test-helper');
const findOrganizationStudents = require('../../../../lib/domain/usecases/find-organization-students');

describe('Unit | UseCase | find-organization-students', () => {

  // given
  const organizationId = 'organization id';
  const userId = 'user id';
  const username = 'username';
  const user = { username };

  const studentNotYetReconcilied = { id: 'non reconcilied' };
  const studentReconcilied = { id: 'reconcilied', userId };
  const studentReconciliedWithUserInformations = { ...studentReconcilied, ...{ username }  };

  let res;
  const students = [studentNotYetReconcilied, studentReconcilied ];
  const userRepository = { get: sinon.stub().withArgs(userId).returns(user) };
  const studentRepository = { findByOrganizationId: sinon.stub().withArgs({ organizationId }).returns(students) };

  beforeEach(async function() {
    // when
    res = await findOrganizationStudents({ organizationId, studentRepository, userRepository });
  });

  // THEN.... :)
  it('should fetch students matching organization', function() {
    expect(studentRepository.findByOrganizationId).to.have.been.calledWithExactly({ organizationId });
  });

  it('should fetch the user if the student is reconcilied', function() {
    expect(userRepository.get).to.have.been.calledWithExactly(studentReconcilied.userId);
  });

  it('should return students', function() {
    expect(res).to.deep.equal([studentNotYetReconcilied, studentReconciliedWithUserInformations ]);
  });

});

