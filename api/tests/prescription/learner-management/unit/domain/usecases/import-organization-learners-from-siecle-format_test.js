import { expect, sinon, catchErr } from '../../../../../test-helper.js';
import { importOrganizationLearnersFromSIECLEFormat } from '../../../../../../src/prescription/learner-management/domain/usecases/import-organization-learners-from-siecle-format.js';
import { FileValidationError } from '../../../../../../lib/domain/errors.js';
import { SiecleXmlImportError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { OrganizationLearner } from '../../../../../../lib/domain/models/OrganizationLearner.js';
import { SiecleParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/xml/siecle-parser.js';

import fs from 'fs/promises';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';
import { SiecleFileStreamer } from '../../../../../../src/prescription/learner-management/infrastructure/utils/xml/siecle-file-streamer.js';
const i18n = getI18n();

describe('Unit | UseCase | import-organization-learners-from-siecle', function () {
  const organizationUAI = '123ABC';
  const organizationId = 1234;
  let format;
  let parseStub;
  let organizationLearnersCsvServiceStub;
  let organizationLearnerRepositoryStub;
  let organizationRepositoryStub;
  let siecleServiceStub;
  let siecleFileStreamerSymbol;
  let payload = null;
  let domainTransaction;

  beforeEach(function () {
    sinon.stub(fs, 'readFile');
    domainTransaction = Symbol();
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });

    sinon.stub(SiecleParser, 'create');
    parseStub = sinon.stub();
    SiecleParser.create.returns({ parse: parseStub });

    siecleFileStreamerSymbol = Symbol('siecleFileStreamerSymbol');
    sinon.stub(SiecleFileStreamer, 'create');
    SiecleFileStreamer.create.resolves(siecleFileStreamerSymbol);

    format = 'xml';
    organizationLearnersCsvServiceStub = { extractOrganizationLearnersInformation: sinon.stub() };
    organizationLearnerRepositoryStub = {
      addOrUpdateOrganizationOfOrganizationLearners: sinon.stub(),
      addOrUpdateOrganizationAgriOrganizationLearners: sinon.stub(),
      findByOrganizationId: sinon.stub(),
      disableAllOrganizationLearnersInOrganization: sinon.stub().resolves(),
    };
    siecleServiceStub = {
      unzip: sinon.stub(),
      detectEncoding: sinon.stub(),
    };

    siecleServiceStub.unzip.returns({ file: payload.path, directory: null });
    siecleServiceStub.detectEncoding.returns('utf8');

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
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          siecleService: siecleServiceStub,
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
        parseStub.resolves(extractedOrganizationLearnersInformations);

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
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          siecleService: siecleServiceStub,
        });

        // then
        const organizationLearners = [
          { lastName: 'UpdatedStudent1', nationalStudentId: 'INE1' },
          { lastName: 'UpdatedStudent2', nationalStudentId: 'INE2' },
          { lastName: 'StudentToCreate', nationalStudentId: 'INE3' },
        ];

        expect(SiecleParser.create).to.have.been.calledWithExactly(
          { externalId: organizationUAI },
          siecleFileStreamerSymbol,
        );
        expect(
          organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners,
        ).to.have.been.calledWithExactly(organizationLearners, organizationId, domainTransaction);
        expect(organizationLearnerRepositoryStub.addOrUpdateOrganizationOfOrganizationLearners).to.not.throw();
      });
    });

    it('should disable all previous organization learners', async function () {
      // given
      format = 'xml';
      payload = { path: 'file.xml' };

      const extractedOrganizationLearnersInformations = [{ nationalStudentId: 'INE1' }];
      organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
      parseStub.resolves(extractedOrganizationLearnersInformations);

      organizationLearnerRepositoryStub.findByOrganizationId.resolves();

      // when
      await importOrganizationLearnersFromSIECLEFormat({
        organizationId,
        payload,
        format,
        organizationRepository: organizationRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        siecleService: siecleServiceStub,
      });

      // then
      expect(
        organizationLearnerRepositoryStub.disableAllOrganizationLearnersInOrganization,
      ).to.have.been.calledWithExactly({ domainTransaction, organizationId, nationalStudentIds: ['INE1'] });
    });
  });

  context('when the import fails', function () {
    let error;

    context('because there is no organization learners imported', function () {
      beforeEach(function () {
        // given
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        parseStub.resolves([]);
      });

      it('should throw a SiecleXmlImportError', async function () {
        error = await catchErr(importOrganizationLearnersFromSIECLEFormat)({
          organizationId,
          payload,
          format,
          organizationRepository: organizationRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          siecleService: siecleServiceStub,
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
          organizationRepository: organizationRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          siecleService: siecleServiceStub,
        });

        // then
        expect(error).to.be.instanceOf(FileValidationError);
        expect(error.code).to.equal('INVALID_FILE_EXTENSION');
        expect(error.meta.fileExtension).to.equal('txt');
      });
    });
  });
});
