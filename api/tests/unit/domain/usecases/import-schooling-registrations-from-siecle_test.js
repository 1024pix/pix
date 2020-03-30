const { expect, sinon, catchErr } = require('../../../test-helper');
const importSchoolingRegistrationsFromSIECLE = require('../../../../lib/domain/usecases/import-schooling-registrations-from-siecle');
const { FileValidationError, SchoolingRegistrationsCouldNotBeSavedError, SameNationalStudentIdInFileError, SameNationalStudentIdInOrganizationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | import-schooling-registrations-from-siecle', () => {

  let organizationId;
  let buffer;
  let schoolingRegistrationsXmlServiceStub;
  let schoolingRegistrationRepositoryStub;

  beforeEach(() => {
    organizationId = 1234;
    buffer = null;
    schoolingRegistrationsXmlServiceStub = { extractSchoolingRegistrationsInformationFromSIECLE: sinon.stub() };
    schoolingRegistrationRepositoryStub = { addOrUpdateOrganizationSchoolingRegistrations: sinon.stub(), findByOrganizationId: sinon.stub() };
  });

  context('when extracted schoolingRegistrations informations can be imported', () => {

    it('should save these informations', async () => {

      // given
      const extractedschoolingRegistrationsInformations = [
        { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
        { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
        { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
      ];
      schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns(extractedschoolingRegistrationsInformations);

      const schoolingRegistrationsToUpdate = [
        { lastName: 'Student1', nationalStudentId: 'INE1' },
        { lastName: 'Student2', nationalStudentId: 'INE2' }
      ];
      schoolingRegistrationRepositoryStub.findByOrganizationId.resolves(schoolingRegistrationsToUpdate);

      // when
      await importSchoolingRegistrationsFromSIECLE({ organizationId, buffer, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

      // then
      const schoolingRegistrations = [
        { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
        { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
        { lastName: 'StudentToCreate', nationalStudentId: 'INE3' }
      ];

      expect(schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE).to.have.been.calledWith(buffer);
      expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.have.been.calledWith(schoolingRegistrations, organizationId);
      expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.not.throw();
    });
  });

  context('when the import fails', () => {

    let result;

    context('because the file is not valid', () => {
      beforeEach(() => {
        // given
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns([]);
      });

      it('should throw a FileValidationError', async () => {
        // when
        const result = await catchErr(importSchoolingRegistrationsFromSIECLE)({ organizationId, buffer, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
      });
    });

    context('because informations cannot be saved', () => {
      beforeEach(async () => {
        // given
        const extractedSchoolingRegistrationInformations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1', organizationId },
        ];
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns(extractedSchoolingRegistrationInformations);
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves();
        schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations.throws(new SchoolingRegistrationsCouldNotBeSavedError());
      });

      it('should throw a SchoolingRegistrationsCouldNotBeSavedError', async () => {
        // when
        result = await catchErr(importSchoolingRegistrationsFromSIECLE)({ organizationId, buffer, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);
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
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns(extractedStudentsInformations);
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves();
        schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations.throws(new SameNationalStudentIdInOrganizationError());
      });

      it('should throw a SameNationalStudentIdInOrganizationError', async () => {
        // when
        result = await catchErr(importSchoolingRegistrationsFromSIECLE)({ organizationId, buffer, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SameNationalStudentIdInFileError);
      });
    });
  });
});
