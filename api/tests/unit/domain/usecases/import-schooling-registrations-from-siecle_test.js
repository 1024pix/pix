const { expect, sinon, catchErr } = require('../../../test-helper');
const iconv = require('iconv-lite');
const importSchoolingRegistrationsFromSIECLEFormat = require('../../../../lib/domain/usecases/import-schooling-registrations-from-siecle');
const { FileValidationError, SchoolingRegistrationsCouldNotBeSavedError, SameNationalStudentIdInFileError, SameNationalStudentIdInOrganizationError } = require('../../../../lib/domain/errors');
const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const { COLUMNS } = require('../../../../lib/infrastructure/serializers/csv/schooling-registration-parser');

const schoolingRegistrationCsvColumns = COLUMNS.map((column) => column.label).join(';');

describe('Unit | UseCase | import-schooling-registrations-from-siecle', () => {

  const organizationUAI = '123ABC';
  const organizationId = 1234;
  let buffer;
  let format;
  let schoolingRegistrationsXmlServiceStub;
  let schoolingRegistrationRepositoryStub;
  let organizationRepositoryStub;

  beforeEach(() => {
    buffer = null;
    format = 'xml';
    schoolingRegistrationsXmlServiceStub = { extractSchoolingRegistrationsInformationFromSIECLE: sinon.stub() };
    schoolingRegistrationRepositoryStub = { addOrUpdateOrganizationSchoolingRegistrations: sinon.stub(), findByOrganizationId: sinon.stub() };
    organizationRepositoryStub = { get: sinon.stub() };
  });

  context('when extracted schoolingRegistrations informations can be imported', () => {

    context('when the format is CSV', () => {
      it('should save these informations', async () => {
        format = 'csv';
        const input = `${schoolingRegistrationCsvColumns}
        123F;Beatrix;The;Bride;Kiddo;Black Mamba;01/01/1970;97422;;974;99100;ST;MEF1;Division 1;
        456F;O-Ren;;;Ishii;Cottonmouth;01/01/1980;;Shangai;99;99132;ST;MEF1;Division 2;
        `;
        buffer = iconv.encode(input, 'utf8');
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

        // when
        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, buffer, format, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.have.been.calledWith([schoolingRegistration1, schoolingRegistration2], organizationId);
      });
    });

    context('when the format is XML', () => {
      it('should save these informations', async () => {
        // given
        const extractedSchoolingRegistrationsInformations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
          { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
          { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
        ];
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE
          .returns({ UAIFromSIECLE: organizationUAI, resultFromExtraction: extractedSchoolingRegistrationsInformations });

        const schoolingRegistrationsToUpdate = [
          { lastName: 'Student1', nationalStudentId: 'INE1' },
          { lastName: 'Student2', nationalStudentId: 'INE2' },
        ];
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves(schoolingRegistrationsToUpdate);
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });

        // when
        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, buffer, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        const schoolingRegistrations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
          { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
          { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
        ];

        expect(schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE).to.have.been.calledWith(buffer);
        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.have.been.calledWith(schoolingRegistrations, organizationId);
        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.not.throw();
      });
    });
  });

  context('when the import fails', () => {

    let result;

    context('because the file is not valid', () => {
      beforeEach(() => {
        // given
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns({ UAIFromSIECLE: organizationUAI, resultFromExtraction: [] });
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      });

      it('should throw a FileValidationError', async () => {
        // when
        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, buffer, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
        expect(result.message).to.equal('Aucune inscription d’élève n’a pu être importée depuis ce fichier. Vérifiez que le fichier est conforme.');
      });
    });

    context('because the file format is not valid', () => {
      beforeEach(() => {
        // given
        format = 'pdf';
      });

      it('should throw a FileValidationError', async () => {
        // when
        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, buffer, format, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
        expect(result.message).to.equal('Format de fichier non valide.');
      });
    });

    context('because organization UAI imported is not the same as organization UAI registered', () => {
      beforeEach(async () => {
        // given
        const extractedStudentsInformations = [{ nationalStudentId: '12345678' }];
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE
          .returns({ UAIFromSIECLE: organizationUAI, resultFromExtraction: extractedStudentsInformations });
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves();
        schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations.throws(new SameNationalStudentIdInOrganizationError());
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: 'otherOrganizationUAI' });

      });

      it('should throw a FileValidationError', async () => {
        // when
        result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, buffer, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
        expect(result.message).to.equal('Aucun étudiant n’a été importé. L’import n’est pas possible car l’UAI du fichier SIECLE ne correspond pas à celui de votre établissement. En cas de difficulté, contactez support.pix.fr.');
      });
    });

    context('because informations cannot be saved', () => {
      beforeEach(async () => {
        // given
        const extractedSchoolingRegistrationInformations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1', organizationId },
        ];
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE
          .returns({ UAIFromSIECLE: organizationUAI, resultFromExtraction: extractedSchoolingRegistrationInformations });
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves();
        schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations.throws(new SchoolingRegistrationsCouldNotBeSavedError());
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });

      });

      it('should throw a SchoolingRegistrationsCouldNotBeSavedError', async () => {
        // when
        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, buffer, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SchoolingRegistrationsCouldNotBeSavedError);
        expect(result.message).to.equal('Une erreur est survenue durant le traitement.');
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
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE
          .returns({ UAIFromSIECLE: organizationUAI, resultFromExtraction: extractedStudentsInformations });
        schoolingRegistrationRepositoryStub.findByOrganizationId.resolves();
        schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations.throws(new SameNationalStudentIdInOrganizationError());
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      });

      it('should throw a SameNationalStudentIdInOrganizationError', async () => {
        // when
        result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, buffer, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SameNationalStudentIdInFileError);
        expect(result.message).to.equal('Un INE est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.');
      });
    });
  });
});
