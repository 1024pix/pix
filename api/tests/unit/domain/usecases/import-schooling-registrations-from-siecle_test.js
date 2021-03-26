const { expect, sinon, catchErr } = require('../../../test-helper');
const importSchoolingRegistrationsFromSIECLEFormat = require('../../../../lib/domain/usecases/import-schooling-registrations-from-siecle');
const { FileValidationError, SiecleXmlImportError } = require('../../../../lib/domain/errors');

const SchoolingRegistration = require('../../../../lib/domain/models/SchoolingRegistration');
const SchoolingRegistrationParser = require('../../../../lib/infrastructure/serializers/csv/schooling-registration-parser');

const fs = require('fs').promises;

const { getI18n } = require('../../../tooling/i18n/i18n');
const i18n = getI18n();

describe('Unit | UseCase | import-schooling-registrations-from-siecle', () => {

  const organizationUAI = '123ABC';
  const organizationId = 1234;
  let format;
  let schoolingRegistrationsXmlServiceStub;
  let schoolingRegistrationRepositoryStub;
  let organizationRepositoryStub;
  let payload = null;

  beforeEach(() => {
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
  afterEach(() => {
    sinon.restore();
  });

  context('when extracted schoolingRegistrations informations can be imported', () => {
    let parser;
    payload = { path: 'file.csv' };
    const buffer = 'data';

    beforeEach(() => {
      format = 'csv';
      parser = { parse: sinon.stub() };
      fs.readFile.withArgs(payload.path).resolves(buffer);

    });
    context('when the format is CSV', () => {
      it('should save these informations for SCO', async () => {
        const organization = { isAgriculture: false, externalId: organizationUAI };
        organizationRepositoryStub.get.withArgs(organizationId).resolves(organization);
        SchoolingRegistrationParser.buildParser.withArgs(buffer, organizationId, i18n, organization.isAgriculture).returns(parser);

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

        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub, i18n });

        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationSchoolingRegistrations).to.have.been.called;
      });

      it('should save these informations for SCO Agri', async () => {
        const organization = { isAgriculture: true, externalId: organizationUAI };
        organizationRepositoryStub.get.withArgs(organizationId).resolves(organization);
        SchoolingRegistrationParser.buildParser.withArgs(buffer, organizationId, i18n, organization.isAgriculture).returns(parser);

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
        await importSchoolingRegistrationsFromSIECLEFormat({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub, i18n });

        expect(schoolingRegistrationRepositoryStub.addOrUpdateOrganizationAgriSchoolingRegistrations).to.have.been.calledWith([schoolingRegistration1, schoolingRegistration2], organizationId);
      });
    });
    context('when the format is XML', async () => {
      beforeEach(() => {
        format = 'xml';
      });

      it('should save these informations', async () => {
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

  context('when the import fails', () => {

    let error;

    context('because there is no schooling registrations imported', () => {
      beforeEach(() => {
        // given
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        schoolingRegistrationsXmlServiceStub.extractSchoolingRegistrationsInformationFromSIECLE.returns([]);
      });

      it('should throw a SiecleXmlImportError', async () => {

        error = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, organizationRepository: organizationRepositoryStub, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(error).to.be.instanceOf(SiecleXmlImportError);
        expect(error.code).to.equal('EMPTY');
      });
    });

    context('because the file format is not valid', () => {
      beforeEach(() => {
        // given
        format = 'txt';
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      });

      it('should throw a FileValidationError', async () => {
        // when
        error = await catchErr(importSchoolingRegistrationsFromSIECLEFormat)({ organizationId, payload, format, schoolingRegistrationsXmlService: schoolingRegistrationsXmlServiceStub, organizationRepository: organizationRepositoryStub, schoolingRegistrationRepository: schoolingRegistrationRepositoryStub });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('INVALID_FILE_EXTENSION');
        expect(error.meta.fileExtension).to.equal('txt');
      });
    });
  });
});
