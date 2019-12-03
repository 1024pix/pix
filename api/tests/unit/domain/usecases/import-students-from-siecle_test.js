const { expect, sinon, catchErr } = require('../../../test-helper');
const importStudentsFromSIECLE = require('../../../../lib/domain/usecases/import-students-from-siecle');
const { FileValidationError, ObjectAlreadyExisting } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | import-students-from-siecle', () => {

  let organizationId;
  let buffer;
  let expectedResult;
  let studentsXmlServiceStub;
  let studentRepositoryStub;

  beforeEach(() => {
    organizationId = 1234;
    buffer = null;
    expectedResult = Symbol('batch save result');
    studentsXmlServiceStub = { extractStudentsInformationFromSIECLE: sinon.stub() };
    studentRepositoryStub = { batchSave: sinon.stub(), checkIfAtLeastOneStudentIsInOrganization: sinon.stub().throws('unexpected call') };
  });

  it('should succeed', async () => {
    // given
    studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns([ { lastName: 'Student1', nationalStudentId: 'INE1' }, { lastName: 'Student2', nationalStudentId: 'INE2' } ]);
    studentRepositoryStub.checkIfAtLeastOneStudentIsInOrganization.withArgs({ nationalStudentIds: [ 'INE1', 'INE2' ], organizationId }).resolves(false);
    studentRepositoryStub.batchSave.resolves(expectedResult);

    // when
    const result = await importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

    // then
    expect(studentsXmlServiceStub.extractStudentsInformationFromSIECLE).to.have.been.calledWith(buffer);
    expect(studentRepositoryStub.batchSave).to.have.been.calledWith([ { lastName: 'Student1', nationalStudentId: 'INE1', organizationId }, { lastName: 'Student2', nationalStudentId: 'INE2', organizationId } ]);
    expect(result).to.equal(expectedResult);
  });

  it('should throw a FileValidationError when file is not valid', async () => {
    // given
    studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns([]);

    // when
    const result = await catchErr(importStudentsFromSIECLE)({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

    // then
    expect(result).to.be.instanceOf(FileValidationError);
  });

  it('should throw a ObjectAlreadyExisting when a student is already imported in the same organization', async () => {
    // given
    studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns([ { lastName: 'Student1', nationalStudentId: 'INE1' }, { lastName: 'Student2', nationalStudentId: 'INE2' } ]);
    studentRepositoryStub.checkIfAtLeastOneStudentIsInOrganization.withArgs({ nationalStudentIds: [ 'INE1', 'INE2' ], organizationId }).resolves(true);

    // when
    const result = await catchErr(importStudentsFromSIECLE)({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

    // then
    expect(result).to.be.instanceOf(ObjectAlreadyExisting);
  });
});
