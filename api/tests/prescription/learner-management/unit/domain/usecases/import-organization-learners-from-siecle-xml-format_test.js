import fs from 'fs/promises';

import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import { SiecleXmlImportError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { importOrganizationLearnersFromSIECLEXMLFormat } from '../../../../../../src/prescription/learner-management/domain/usecases/import-organization-learners-from-siecle-xml-format.js';
import { SiecleParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/xml/siecle-parser.js';
import { SiecleFileStreamer } from '../../../../../../src/prescription/learner-management/infrastructure/utils/xml/siecle-file-streamer.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | import-organization-learners-from-siecle-xml', function () {
  const organizationUAI = '123ABC';
  const organizationId = 1234;
  let format;
  let parseStub;
  let parseUAJStub;
  let organizationLearnerRepositoryStub;
  let organizationRepositoryStub;
  let organizationImportRepositoryStub;
  let siecleServiceStub;
  let siecleFileStreamerSymbol;
  let payload = { path: 'file.xml' };
  let domainTransaction;
  let importStorageStub;

  beforeEach(function () {
    sinon.stub(fs, 'rm');
    sinon.stub(fs, 'readFile');
    domainTransaction = Symbol();
    sinon.stub(DomainTransaction, 'execute').callsFake((callback) => {
      return callback(domainTransaction);
    });

    organizationImportRepositoryStub = {
      get: sinon.stub(),
      getLastByOrganizationId: sinon.stub(),
      save: sinon.stub(),
    };

    organizationImportRepositoryStub.getLastByOrganizationId.callsFake(() =>
      OrganizationImport.create({ organizationId, createdBy: 2 }),
    );

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };
    sinon.stub(SiecleParser, 'create');
    parseStub = sinon.stub();
    parseUAJStub = sinon.stub();
    SiecleParser.create.returns({ parse: parseStub, parseUAJ: parseUAJStub });

    siecleFileStreamerSymbol = Symbol('siecleFileStreamerSymbol');
    sinon.stub(SiecleFileStreamer, 'create');
    SiecleFileStreamer.create.resolves(siecleFileStreamerSymbol);

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
    beforeEach(function () {
      format = 'xml';
      payload = { path: 'file.zip' };
      const readableStream = Symbol('readableStream');
      siecleServiceStub.unzip.withArgs(payload.path).resolves({ file: payload.path, directory: null });
      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves('file.xml');
      importStorageStub.readFile.withArgs(payload.path).resolves(readableStream);
    });

    context('when the file is zipped', function () {
      it('should remove temporary directory', async function () {
        // given
        siecleServiceStub.unzip.withArgs(payload.path).resolves({ directory: 'tmp', file: 'file.xml' });

        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });

        const extractedOrganizationLearnersInformations = [{ lastName: 'Student1', nationalStudentId: 'INE1' }];
        parseStub.resolves(extractedOrganizationLearnersInformations);

        organizationLearnerRepositoryStub.findByOrganizationId.resolves([]);

        // when
        await importOrganizationLearnersFromSIECLEXMLFormat({
          organizationId,
          payload,
          organizationRepository: organizationRepositoryStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
        });

        expect(fs.rm).to.have.been.calledWith('tmp', { recursive: true });
      });
    });

    it('should save these informations', async function () {
      // given
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
      await importOrganizationLearnersFromSIECLEXMLFormat({
        organizationId,
        payload,
        format,
        organizationRepository: organizationRepositoryStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        siecleService: siecleServiceStub,
        importStorage: importStorageStub,
      });

      // then

      expect(SiecleParser.create).to.have.been.calledWithExactly(siecleFileStreamerSymbol);
    });
  });

  context('when the import fails', function () {
    let error;

    context('because there is no organization learners imported', function () {
      beforeEach(function () {
        // given
        const readableStream = Symbol('readableStream');
        siecleServiceStub.unzip.withArgs(payload.path).resolves({ file: payload.path, directory: null });
        importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves('file.xml');
        importStorageStub.readFile.withArgs(payload.path).resolves(readableStream);
        organizationRepositoryStub.get.withArgs(organizationId).resolves({ externalId: organizationUAI });
        parseStub.resolves([]);
      });

      it('should throw a SiecleXmlImportError', async function () {
        error = await catchErr(importOrganizationLearnersFromSIECLEXMLFormat)({
          organizationId,
          payload,
          organizationRepository: organizationRepositoryStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
        });

        // then
        expect(error).to.be.instanceOf(SiecleXmlImportError);
        expect(error.code).to.equal('EMPTY');
      });
    });
  });

  context('save import state in database', function () {
    describe('success case', function () {
      it('should save uploaded, validated state each after each', async function () {
        // given
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
        await importOrganizationLearnersFromSIECLEXMLFormat({
          organizationId,
          payload,
          format,
          organizationRepository: organizationRepositoryStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
        });

        // then

        const firstSaveCall = organizationImportRepositoryStub.save.getCall(0).args[0];
        const secondSaveCall = organizationImportRepositoryStub.save.getCall(1).args[0];

        expect(firstSaveCall.status).to.equal('UPLOADED');
        expect(secondSaveCall.status).to.equal('VALIDATED');
      });
    });
    describe('errors case', function () {
      describe('when there is an upload error', function () {
        it('should save UPLOAD_ERROR status', async function () {
          //given
          importStorageStub.sendFile.rejects();

          // when
          await catchErr(importOrganizationLearnersFromSIECLEXMLFormat)({
            organizationId,
            payload,
            format,
            organizationRepository: organizationRepositoryStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
            siecleService: siecleServiceStub,
            importStorage: importStorageStub,
          });

          //then
          expect(organizationImportRepositoryStub.save.getCall(0).args[0].status).to.equal('UPLOAD_ERROR');
        });

        it('should save UPLOAD_ERROR status if zip is invalid', async function () {
          //given
          siecleServiceStub.unzip.rejects();

          // when
          await catchErr(importOrganizationLearnersFromSIECLEXMLFormat)({
            organizationId,
            payload,
            format,
            organizationRepository: organizationRepositoryStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
            siecleService: siecleServiceStub,
            importStorage: importStorageStub,
          });

          //then
          expect(organizationImportRepositoryStub.save.getCall(0).args[0].status).to.equal('UPLOAD_ERROR');
        });
      });

      describe('when there is a validation error', function () {
        it('should save VALIDATION_ERROR status', async function () {
          //given
          parseStub.rejects();

          // when
          await catchErr(importOrganizationLearnersFromSIECLEXMLFormat)({
            organizationId,
            payload,
            format,
            organizationRepository: organizationRepositoryStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
            siecleService: siecleServiceStub,
            importStorage: importStorageStub,
          });

          //then
          expect(organizationImportRepositoryStub.save.getCall(1).args[0].status).to.equal('VALIDATION_ERROR');
        });
      });
    });
  });
});
