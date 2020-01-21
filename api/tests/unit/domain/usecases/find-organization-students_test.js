const { expect, sinon, domainBuilder } = require('../../../test-helper');
const findOrganizationStudents = require('../../../../lib/domain/usecases/find-organization-students');
const Student = require('../../../../lib/domain/models/Student');

describe('Unit | UseCase | find-organization-students', () => {

  it('should succeed', async () => {
    // given
    const organizationId = 1234;
    const studentRepositoryStub = { findByOrganizationId: sinon.stub() };
    studentRepositoryStub.findByOrganizationId.resolves([]);

    // when
    await findOrganizationStudents({ organizationId, studentRepository: studentRepositoryStub });

    // then
    expect(studentRepositoryStub.findByOrganizationId).to.have.been.calledWith({ organizationId });
  });

  it('should return the Students belong to the given organization ID', async () => {
    // given
    const organizationId = 1234;

    const foundStudents = [domainBuilder.buildStudent({ organizationId })];
    const studentRepositoryStub = {
      findByOrganizationId: sinon.stub().resolves(foundStudents)
    };

    // when
    const students = await findOrganizationStudents({ organizationId, studentRepository: studentRepositoryStub });

    // then
    expect(students).to.have.length(1);
    expect(students[0]).to.be.an.instanceOf(Student);
    expect(students).to.deep.equal(foundStudents);
  });

  it('should return the user\'s username if student userId is defined', async () => {
    // given
    const organizationId = 1234;

    const foundUser = domainBuilder.buildUser();
    const foundStudents = [domainBuilder.buildStudent({ organizationId, userId:  foundUser.id })];
    const studentRepositoryStub = {
      findByOrganizationId: sinon.stub().resolves(foundStudents)
    };
    const userRepositoryStub = {
      get: sinon.stub().resolves(foundUser)
    };

    // when
    const students = await findOrganizationStudents({ organizationId, studentRepository: studentRepositoryStub , userRepository: userRepositoryStub });

    // then
    expect(students).to.have.length(1);
    expect(students[0]).to.be.an.instanceOf(Student);
    expect(students).to.deep.equal(foundStudents);
  });
});
