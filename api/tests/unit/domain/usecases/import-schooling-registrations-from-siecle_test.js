const { expect, sinon, catchErr } = require('../../../test-helper');
const importSchoolingRegistrationsFromSIECLEFormat = require('../../../../lib/domain/usecases/import-schooling-registrations-from-siecle');
const { FileValidationError, SchoolingRegistrationsCouldNotBeSavedError, SameNationalStudentIdInFileError, SameNationalStudentIdInOrganizationError } = require('../../../../lib/domain/errors');
const { COLUMNS } = require('../../../../lib/infrastructure/serializers/csv/schooling-registration-parser');

const schoolingRegistrationCsvColumns = COLUMNS.map((column) => column.label).join(';');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const fs = require('fs').promises;

describe('Unit | UseCase | import-schooling-registrations-from-siecle', () => {

  const organizationUAI = '123ABC';
  const organizationId = 1234;
  let format;
  let schoolingRegistrationsXmlServiceStub;
  let schoolingRegistrationRepositoryStub;
  let organizationRepositoryStub;
  let payload = null;

  beforeEach(() => {
    format = 'xml';
    schoolingRegistrationsXmlServiceStub = { extractSchoolingRegistrationsInformationFromSIECLE: sinon.stub() };
    schoolingRegistrationRepositoryStub = {
      addOrUpdateOrganizationSchoolingRegistrations: sinon.stub(),
      addOrUpdateOrganizationAgriSchoolingRegistrations: sinon.stub(),
      findByOrganizationId: sinon.stub(),
    };
    organizationRepositoryStub = { get: sinon.stub() };
  });

  context('when extracted schoolingRegistrations informations can be imported', () => {

    context('when the format is CSV', () => {
      it('should save these informations for SCO', async () => {
        format = 'csv';
        const input = `${schoolingRegistrationCsvColumns}
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;974;99100;ST;MEF1;Division 1;
        456F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
        `;
        const path = __dirname + '/siecle.csv';
        payload = { path };
        await fs.writeFile(path, input);

        // given
        const schoolingRegistration1 = new SchoolingRegistration({
          id: undefined,
          nationalStudentId: '123F',
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          birthdate: '1970-01-01',
          birthCityCode: '97422',
          birthProvinceCode: '974',
          birthCountryCode: '100',
          status: 'ST',
          MEFCode: 'MEF1',
          division: 'Division 1',
          organizationId,
        });
        const schoolingRegistration2 = new SchoolingRegistration({
          id: undefined,
          nationalStudentId: '456F',
          firstName: 'O-Ren',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          birthdate: '1980-01-01',
          birthCity: 'Shangai',
          birthProvinceCode: '99',
          birthCountryCode: '132',
          status: 'ST',
          MEFCode: 'MEF1',
          division: 'Division 2',
          organizationId,
        });

        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });

        // when
        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.have.been.calledWith([schoolingRegistration1, schoolingRegistration2], organizationId);
      });

      it('should save these informations for SCO Agri', async () => {
        format = 'csv';
        const input = `${schoolingRegistrationCsvColumns}
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;974;99100;ST;MEF1;Division 1;
        0123456789F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;AP;MEF1;Division 2;
        `;
        const path = __dirname + '/siecle.csv';
        payload = { path };
        await fs.writeFile(path, input);

        // given
        const schoolingRegistration1 = new SchoolingRegistration({
          id: undefined,
          nationalStudentId: '123F',
          firstName: 'Beatrix',
          middleName: 'The',
          thirdName: 'Bride',
          lastName: 'Kiddo',
          preferredLastName: 'Black Mamba',
          birthdate: '1970-01-01',
          birthCityCode: '97422',
          birthProvinceCode: '974',
          birthCountryCode: '100',
          status: 'ST',
          MEFCode: 'MEF1',
          division: 'Division 1',
          organizationId,
        });
        const schoolingRegistration2 = new SchoolingRegistration({
          id: undefined,
          nationalApprenticeId: '0123456789F',
          firstName: 'O-Ren',
          lastName: 'Ishii',
          preferredLastName: 'Cottonmouth',
          birthdate: '1980-01-01',
          birthCity: 'Shangai',
          birthProvinceCode: '99',
          birthCountryCode: '132',
          status: 'AP',
          MEFCode: 'MEF1',
          division: 'Division 2',
          organizationId,
        });

        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI, isAgriculture: true });

        // when
        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationAgriSchoolingRegistrations).to.have.been.calledWith([schoolingRegistration1, schoolingRegistration2], organizationId);
      });
    });
    context('when the format is XML', async () => {

      it('should save these informations', async () => {
        // given
        const filePath = __dirname + '/siecle-with-one-valid-student.xml';
        payload = { path: filePath } ;

        await fs.writeFile(filePath, '');

        const extractedSchoolingRegistrationsInformations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
          { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
          { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
        ];
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE
          .returns(extractedSchoolingRegistrationsInformations);

        const schoolingRegistrationsToUpdate = [
          { lastName: 'Student1', nationalStudentId: 'INE1' },
          { lastName: 'Student2', nationalStudentId: 'INE2' },
        ];
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves(schoolingRegistrationsToUpdate);

        // when
        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        const schoolingRegistrations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
          { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
          { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
        ];

        expect(schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE).to.have.been.calledWith(payload.path, { externalId: organizationUAI });
        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.have.been.calledWith(schoolingRegistrations, organizationId);
        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.not.throw();
      });
    });
  });

  context('when the import fails', () => {

    let result;

    context('because the file content is invalid', () => {
      beforeEach(() => {
        // given
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns([]);
      });

      it('should throw a FileValidationError', async () => {
        // when
        const filePath = __dirname + '/not-valid.xml';
        payload = { path: filePath } ;

        await fs.writeFile(filePath, '');

        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
        expect(result.message).to.equal('Aucun élève n’a pu être importé depuis ce fichier. Vérifiez que le fichier est conforme.');
      });
    });

    context('because the file format is not valid', () => {
      beforeEach(() => {
        // given
        format = 'txt';
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      });

      it('should throw a FileValidationError', async () => {
        // given
        const filePath = __dirname + '/wrong-file.txt';
        payload = { path: filePath } ;

        await fs.writeFile(filePath, '');
        // when
        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, organizationRepository: organizationRepositoryStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
        expect(result.message).to.equal('Format de fichier non valide.');
      });
    });

    context('because informations cannot be saved', () => {
      beforeEach(async () => {
        // given
        const extractedSchoolingRegistrationInformations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1', organizationId },
        ];
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE
          .returns(extractedSchoolingRegistrationInformations);
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves();
        schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations.throws(new SchoolingRegistrationsCouldNotBeSavedError());
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });

      });

      it('should throw a SchoolingRegistrationsCouldNotBeSavedError', async () => {
        // given
        const filePath = __dirname + '/siecle.xml';
        payload = { path: filePath } ;

        await fs.writeFile(filePath, '');
        // when
        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);
        expect(result.message).to.equal('Une erreur est survenue durant le traitement.');
      });
    });

    context('because a nationalStudentId appears twice in the file', () => {
      beforeEach(async () => {
        // given
        const sameNationalStudentId = 'SAMEID456';
        const extractedStudentsInformations = [
          { nationalStudentId: sameNationalStudentId },
          { nationalStudentId: sameNationalStudentId },
        ];
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE
          .returns(extractedStudentsInformations);
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves();
        schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations.throws(new SameNationalStudentIdInOrganizationError());
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      });

      it('should throw a SameNationalStudentIdInOrganizationError', async () => {
        // given
        const filePath = __dirname + '/siecle.xml';
        payload = { path: filePath } ;

        await fs.writeFile(filePath, '');

        // when
        result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SameNationalStudentIdInFileError);
        expect(result.message).to.equal('Un INE est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.');
      });
    });
  });
});
