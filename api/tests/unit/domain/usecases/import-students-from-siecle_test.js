const { expect, sinon, catchErr } = require('../../../test-helper');
const importStudentsFromSIECLE = require('../../../../lib/domain/usecases/import-students-from-siecle');
const { FileValidationError, StudentsCouldNotBeSavedError, SameNationalStudentIdInFileError, SameNationalStudentIdInOrganizationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | import-students-from-siecle', () => {

  let organizationId;
  let buffer;
  let studentsXmlServiceStub;
  let studentRepositoryStub;

  beforeEach(() => {
    organizationId = 1234;
    buffer = null;
    studentsXmlServiceStub = { extractStudentsInformationFromSIECLE: sinon.stub() };
    studentRepositoryStub = { addOrUpdateOrganizationStudents: sinon.stub(), findByOrganizationId: sinon.stub() };
  });

  context('when extracted students informations can be imported', () => {

    it('should save these informations', async () => {

      // given
      const extractedStudentsInformations = [
        { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
        { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
        { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
      ];
      studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns(extractedStudentsInformations);

      const studentsToUpdate = [
        { lastName: 'Student1', nationalStudentId: 'INE1' },
        { lastName: 'Student2', nationalStudentId: 'INE2' }
      ];
      studentRepositoryStub.findByOrganizationId.resolves(studentsToUpdate);

      // when
      await importStudentsFromSIECLE({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

      // then
      const students = [
        { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
        { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
        { lastName: 'StudentToCreate', nationalStudentId: 'INE3' }
      ];

      expect(studentsXmlServiceStub.extractStudentsInformationFromSIECLE).to.have.been.calledWith(buffer);
      expect(studentRepositoryStub.addOrUpdateOrganizationStudents).to.have.been.calledWith(students, organizationId);
      expect(studentRepositoryStub.addOrUpdateOrganizationStudents).to.not.throw();
    });
  });

  context('when the import fails', () => {

    let result;

    context('because the file is not valid', () => {
      beforeEach(() => {
        // given
        studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns([]);
      });

      it('should throw a FileValidationError', async () => {
        // when
        const result = await catchErr(importStudentsFromSIECLE)({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
      });
    });

    context('because informations cannot be saved', () => {
      beforeEach(async () => {
        // given
        const extractedStudentsInformations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1', organizationId },
        ];
        studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns(extractedStudentsInformations);
        studentRepositoryStub.findByOrganizationId.resolves();
        studentRepositoryStub.addOrUpdateOrganizationStudents.throws(new StudentsCouldNotBeSavedError());
      });

      it('should throw a StudentsCouldNotBeSavedError', async () => {
        // when
        result = await catchErr(importStudentsFromSIECLE)({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

        // then
        expect(result).to.be.instanceOf(StudentsCouldNotBeSavedError);
      });
    });

    context('because a nationalStudentId is twice in the file', () => {
      beforeEach(async () => {
        // given
        const sameNationalStudentId = 'SAMEID456';
        const extractedStudentsInformations = [
          { nationalStudentId: sameNationalStudentId },
          { nationalStudentId: sameNationalStudentId },
        ];
        studentsXmlServiceStub.extractStudentsInformationFromSIECLE.returns(extractedStudentsInformations);
        studentRepositoryStub.findByOrganizationId.resolves();
        studentRepositoryStub.addOrUpdateOrganizationStudents.throws(new SameNationalStudentIdInOrganizationError());
      });

      it('should throw a SameNationalStudentIdInOrganizationError', async () => {
        // when
        result = await catchErr(importStudentsFromSIECLE)({ organizationId, buffer, studentsXmlService: studentsXmlServiceStub, studentRepository: studentRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SameNationalStudentIdInFileError);
      });
    });
  });
});
