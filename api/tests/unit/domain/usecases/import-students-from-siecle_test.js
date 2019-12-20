const { expect, sinon, catchErr } = require('../../../test-helper');
const importStudentsFromSIECLE = require('../../../../lib/domain/usecases/import-students-from-siecle');
const { FileValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | import-students-from-siecle', () => {

  let organizationId;
  let buffer;
  let studentsXmlServiceStub;
  let studentRepositoryStub;

  beforeEach(() => {
    organizationId = 1234;
    buffer = null;
    studentsXmlServiceStub = { extractStudentsInformationFromSIECLE: sinon.stub() };
    studentRepositoryStub = { batchCreate: sinon.stub(), batchUpdateWithOrganizationId: sinon.stub(), findByOrganizationId: sinon.stub() };
  });

  context('when all students in the file are not imported yet in the organisation', () => {

    it('should add students to the organization', async () => {
      // given
      studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns([ { lastName: 'Student1', nationalStudentId: 'INE1' }, { lastName: 'Student2', nationalStudentId: 'INE2' } ]);
      studentRepositoryStub.batchCreate.resolves();

      // when
      await importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

      // then
      expect(studentsXmlServiceStub.extractStudentsInformationFromSIECLE).to.have.been.calledWith(buffer);
      expect(studentRepositoryStub.batchCreate).to.have.been.calledWith([ { lastName: 'Student1', nationalStudentId: 'INE1', organizationId }, { lastName: 'Student2', nationalStudentId: 'INE2', organizationId } ]);
    });
  });

  context('when all students in the file are already imported in the organization', () => {

    it('should update these students', async () => {

      // given
      const students = [
        { lastName: 'Student1', nationalStudentId: 'INE1' },
        { lastName: 'Student2', nationalStudentId: 'INE2' }
      ];

      const studentsToUpdate = [
        { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
        { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' }
      ];

      studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns(studentsToUpdate);
      studentRepositoryStub.findByOrganizationId.resolves(students);
      studentRepositoryStub.batchUpdateWithOrganizationId.resolves();

      // when
      await importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

      // then
      expect(studentsXmlServiceStub.extractStudentsInformationFromSIECLE).to.have.been.calledWith(buffer);
      expect(studentRepositoryStub.batchUpdateWithOrganizationId).to.have.been.calledWith(studentsToUpdate, organizationId);
    });
  });

  context('when some students in the file are already imported in the organization, and others are not', () => {

    it('should update and create these students', async () => {

      // given
      const students = [
        { lastName: 'Student1', nationalStudentId: 'INE1' }
      ];

      const studentsToUpdate = [
        { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' }
      ];

      const studentsToCreate = [
        { lastName: 'CreatedStudent2', nationalStudentId: 'INE2' }
      ];

      studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns([...studentsToUpdate, ...studentsToCreate ]);
      studentRepositoryStub.findByOrganizationId.resolves(students);
      studentRepositoryStub.batchUpdateWithOrganizationId.resolves();
      studentRepositoryStub.batchCreate.resolves();

      // when
      await importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

      // then
      expect(studentsXmlServiceStub.extractStudentsInformationFromSIECLE).to.have.been.calledWith(buffer);
      expect(studentRepositoryStub.batchUpdateWithOrganizationId).to.have.been.calledWith(studentsToUpdate, organizationId);
      expect(studentRepositoryStub.batchCreate).to.have.been.calledWith([{ lastName: 'CreatedStudent2', nationalStudentId: 'INE2', organizationId }]);
    });
  });

  it('should throw a FileValidationError when file is not valid', async () => {
    // given
    studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns([]);

    // when
    const result = await catchErr(importStudentsFromSIECLE)({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

    // then
    expect(result).to.be.instanceOf(FileValidationError);
  });
});
