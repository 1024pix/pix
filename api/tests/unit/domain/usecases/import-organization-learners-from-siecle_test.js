const { expect, sinon, catchErr } = require('../../../test-helper');
const importOrganizationLearnersFromSIECLEFormat = require('../../../../lib/domain/usecases/import-organization-learners-from-siecle');
const { FileValidationError, SiecleXmlImportError } = require('../../../../lib/domain/errors');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const OrganizationLearner = require('../../../../lib/domain/models/OrganizationLearner');

const fs = require('fs').promises;

const { getI18n } = require('../../../tooling/i18n/i18n');
const i18n = getI18n();

describe('Unit | UseCase | import-organization-learners-from-siecle', function () {
  const organizationUAI = '123ABC';
  const organizationId = 1234;
  let format;
  let organizationLearnersXmlServiceStub;
  let organizationLearnersCsvServiceStub;
  let organizationLearnerRepositoryStub;
  let organizationRepositoryStub;
  let payload = null;
  let domainTransaction;

  beforeEach(function () {
    sinon.stub(fs, 'unlink');
    sinon.stub(fs, 'readFile');
    domainTransaction = Symbol();
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });
    format = 'xml';
    organizationLearnersXmlServiceStub = { extractOrganizationLearnersInformationFromSIECLE: sinon.stub() };
    organizationLearnersCsvServiceStub = { extractOrganizationLearnersInformation: sinon.stub() };
    organizationLearnerRepositoryStub = {
      addOrUpdateOrganizationOfOrganizationLearners: sinon.stub(),
      addOrUpdateOrganizationAgriOrganizationLearners: sinon.stub(),
      findByOrganizationId: sinon.stub(),
      disableAllOrganizationLearnersInOrganization: sinon.stub().resolves(),
    };
    organizationRepositoryStub = { get: sinon.stub() };
  });

  context('when extracted organizationLearners informations can be imported', function () {
    payload = { path: 'file.csv' };
    const buffer = 'data';

    beforeEach(function () {
      format = 'csv';
      fs.readFile.withArgs(payload.path).resolves(buffer);
    });

    context('when the format is CSV', function () {
      it('should save these informations', async function () {
        const organization = Symbol('organization');
        organizationRepositoryStub.get.withArgs(organizationId).resolves(organization);

        const organizationLearner1 = new OrganizationLearner({
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
        const organizationLearner2 = new OrganizationLearner({
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
        organizationLearnersCsvServiceStub.extractOrganizationLearnersInformation.returns([
          organizationLearner1,
          organizationLearner2,
        ]);

        await importOrganizationLearnersFromSIECLEFormat({
          organizationId,
          payload,
          format,
          organizationRepository: organizationRepositoryStub,
          organizationLearnersCsvService: organizationLearnersCsvServiceStub,
          organizationLearnersXmlService: organizationLearnersXmlServiceStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          i18n,
        });

        expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.have.been.called;
      });
    });

    context('when the format is XML', function () {
      beforeEach(function () {
        format = 'xml';
      });

      it('should save these informations', async function () {
        // given
        payload = { path: 'file.xml' };

        const extractedOrganizationLearnersInformations = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
          { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
          { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
        ];
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        organizationLearnersXmlServiceStub.extractOrganizationLearnersInformationFromSIECLE.returns(
          extractedOrganizationLearnersInformations
        );

        const organizationLearnersToUpdate = [
          { lastName: 'Student1', nationalStudentId: 'INE1' },
          { lastName: 'Student2', nationalStudentId: 'INE2' },
        ];
        organizationLearnerRepositoryStub.findByOrganizationId.resolves(organizationLearnersToUpdate);

        // when
        await importOrganizationLearnersFromSIECLEFormat({
          organizationId,
          payload,
          format,
          organizationRepository: organizationRepositoryStub,
          organizationLearnersXmlService: organizationLearnersXmlServiceStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
        });

        // then
        const organizationLearners = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
          { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
          { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
        ];

        expect(
          organizationLearnersXmlServiceStub.extractOrganizationLearnersInformationFromSIECLE
        ).to.have.been.calledWith(payload.path, { externalId: organizationUAI });
        expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.have.been.calledWith(
          organizationLearners,
          organizationId
        );
        expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.not.throw();
      });
    });

    it('should disable all previous organization learners', async function () {
      // given
      format = 'xml';
      payload = { path: 'file.xml' };

      const extractedOrganizationLearnersInformations = [{ nationalStudentId: 'INE1' }];
      organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      organizationLearnersXmlServiceStub.extractOrganizationLearnersInformationFromSIECLE.returns(
        extractedOrganizationLearnersInformations
      );

      organizationLearnerRepositoryStub.findByOrganizationId.resolves();

      // when
      await importOrganizationLearnersFromSIECLEFormat({
        organizationId,
        payload,
        format,
        organizationRepository: organizationRepositoryStub,
        organizationLearnersXmlService: organizationLearnersXmlServiceStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
      });

      // then
      expect(
        organizationLearnerRepositoryStub.disableAllOrganizationLearnersInOrganization
      ).to.have.been.calledWithExactly({ domainTransaction, organizationId });
    });
  });

  context('when the import fails', function () {
    let error;

    context('because there is no organization learners imported', function () {
      beforeEach(function () {
        // given
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        organizationLearnersXmlServiceStub.extractOrganizationLearnersInformationFromSIECLE.returns([]);
      });

      it('should throw a SiecleXmlImportError', async function () {
        error = await catchErr(importOrganizationLearnersFromSIECLEFormat)({
          organizationId,
          payload,
          format,
          organizationRepository: organizationRepositoryStub,
          organizationLearnersXmlService: organizationLearnersXmlServiceStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(SiecleXmlImportError);
        expect(error.code).to.equal('EMPTY');
      });
    });

    context('because the file format is not valid', function () {
      beforeEach(function () {
        // given
        format = 'txt';
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      });

      it('should throw a FileValidationError', async function () {
        // when
        error = await catchErr(importOrganizationLearnersFromSIECLEFormat)({
          organizationId,
          payload,
          format,
          organizationLearnersXmlService: organizationLearnersXmlServiceStub,
          organizationRepository: organizationRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('INVALID_FILE_EXTENSION');
        expect(error.meta.fileExtension).to.equal('txt');
      });
    });
  });
});
