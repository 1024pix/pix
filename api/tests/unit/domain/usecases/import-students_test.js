const { expect, sinon } = require('../../../test-helper');
const importStudents = require('../../../../lib/domain/usecases/import-students');

describe('Unit | UseCase | import-students', () => {

  it('should succeed', async () => {
    // given
    const organizationId = 1234;
    const buffer = null;
    const lastStudentId = Symbol('last student id');
    const studentsXmlServiceStub = { extractStudentsInformations: sinon.stub() };
    const studentRepositoryStub = { batchSave: sinon.stub() };

    studentsXmlServiceStub.extractStudentsInformations.returns([ { lastName: 'Student1' }, { lastName: 'Student2' } ]);
    studentRepositoryStub.batchSave.resolves([ lastStudentId ]);

    // when
    const result = await importStudents({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

    // then
    expect(studentsXmlServiceStub.extractStudentsInformations).to.have.been.calledWith(buffer);
    expect(studentRepositoryStub.batchSave).to.have.been.calledWith([ { lastName: 'Student1', organizationId }, { lastName: 'Student2', organizationId } ]);
    expect(result).to.equal(lastStudentId);
  });
});
