const { expect, sinon, catchErr } = require('../../../test-helper');
const importSchoolingRegistrationsFromSIECLEFormat = require('../../../../lib/domain/usecases/import-schooling-registrations-from-siecle');
const { FileValidationError, SameNationalStudentIdInFileError, SameNationalStudentIdInOrganizationError } = require('../../../../lib/domain/errors');

const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const SchoolingRegistrationParser = require('../../../../lib/infrastructure/serializers/csv/schooling-registration-parser');

const fs = require('fs').promises;

describe('Unit | UseCase | import-schooling-registrations-from-siecle', function() {

  const organizationUAI = '123ABC';
  const organizationId = 1234;
  let format;
  let schoolingRegistrationsXmlServiceStub;
  let schoolingRegistrationRepositoryStub;
  let organizationRepositoryStub;
  let payload = null;

  beforeEach(function() {
    sinon.stub(fs, 'unlink');
    sinon.stub(fs, 'readFile');
    sinon.stub(SchoolingRegistrationParser, 'buildParser');
    format = 'xml';
    schoolingRegistrationsXmlServiceStub = { extractSchoolingRegistrationsInformationFromSIECLE: sinon.stub() };
    schoolingRegistrationRepositoryStub = {
      addOrUpdateOrganizationSchoolingRegistrations: sinon.stub(),
      addOrUpdateOrganizationAgriSchoolingRegistrations: sinon.stub(),
      findByOrganizationId: sinon.stub(),
    };
    organizationRepositoryStub = { get: sinon.stub() };
  });
  afterEach(function() {
    sinon.restore();
  });

  context('when extracted schoolingRegistrations informations can be imported', function() {
    let parser;
    payload = { path: 'file.csv' };
    const buffer = 'data';

    beforeEach(function() {
      format = 'csv';
      parser = { parse: sinon.stub() };
      fs.readFile.withArgs(payload.path).resolves(buffer);

    });
    context('when the format is CSV', function() {
      it('should save these informations for SCO', async function() {
        const organization = { isAgriculture: false, externalId: organizationUAI };
        organizationRepositoryStub.get.withArgs(organizationId).resolves(organization);
        SchoolingRegistrationParser.buildParser.withArgs(buffer, organizationId, organization.isAgriculture).returns(parser);

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

        parser.parse.returns({ registrations: [schoolingRegistration1, schoolingRegistration2] });

        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.have.been.called;
      });

      it('should save these informations for SCO Agri', async function() {
        const organization = { isAgriculture: true, externalId: organizationUAI };
        organizationRepositoryStub.get.withArgs(organizationId).resolves(organization);
        SchoolingRegistrationParser.buildParser.withArgs(buffer, organizationId, organization.isAgriculture).returns(parser);

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

        parser.parse.returns({ registrations: [schoolingRegistration1, schoolingRegistration2] });

        // when
        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationAgriSchoolingRegistrations).to.have.been.calledWith([schoolingRegistration1, schoolingRegistration2], organizationId);
      });
    });
    context('when the format is XML', async function() {
      beforeEach(function() {
        format = 'xml';
      });

      it('should save these informations', async function() {
        // given
        payload = { path: 'file.xml' } ;

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

  context('when the import fails', function() {

    let result;

    context('because there is no schooling registrations imported', function() {
      beforeEach(function() {
        // given
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns([]);
      });

      it('should throw a FileValidationError', async function() {

        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
        expect(result.message).to.equal('Aucun élève n’a pu être importé depuis ce fichier. Vérifiez que le fichier est conforme.');
      });
    });

    context('because the file format is not valid', function() {
      beforeEach(function() {
        // given
        format = 'txt';
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      });

      it('should throw a FileValidationError', async function() {
        // when
        const result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, organizationRepository: organizationRepositoryStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(FileValidationError);
        expect(result.message).to.equal('Format de fichier non valide.');
      });
    });

    context('because a nationalStudentId appears twice in the file', function() {
      beforeEach(async function() {
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

      it('should throw a SameNationalStudentIdInOrganizationError', async function() {
        // given
        payload = { path: 'file.xml' } ;

        // when
        result = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(result).to.be.instanceOf(SameNationalStudentIdInFileError);
        expect(result.message).to.equal('Un INE est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.');
      });
    });
  });
});
