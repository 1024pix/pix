import fs from 'node:fs/promises';

import { FileUploaded } from '../../../../../../src/prescription/learner-management/domain/events/FileUploaded.js';
import { OrganizationImport } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { uploadSiecleFile } from '../../../../../../src/prescription/learner-management/domain/usecases/upload-siecle-file.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | upload-siecle-file', function () {
  const userId = 123;
  const organizationId = 1234;
  let organizationImportRepositoryStub;
  let siecleServiceStub;
  let payload;
  let importStorageStub;
  let organizationImportStub;
  let organizationImportSavedStub;
  let encoding;
  let s3filename;
  let filename;
  let filepath;
  let eventBusStub;
  let domainTransactionStub;
  let eventStub;

  beforeEach(function () {
    sinon.stub(fs, 'readFile');
    domainTransactionStub = Symbol('domainTransaction');
    sinon.stub(DomainTransaction, 'execute').callsFake((fn) => fn(domainTransactionStub));
    eventStub = Symbol('event');
    sinon.stub(FileUploaded, 'create').returns(eventStub);

    filename = Symbol('filename');
    encoding = Symbol('encoding');
    filepath = Symbol('filepath');
    s3filename = Symbol('filename');

    payload = { path: filename };

    eventBusStub = {
      publish: sinon.stub(),
    };

    eventBusStub.publish.withArgs(eventStub, domainTransactionStub).resolves();

    importStorageStub = {
      sendFile: sinon.stub(),
      readFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    siecleServiceStub = {
      unzip: sinon.stub(),
      detectEncoding: sinon.stub(),
    };

    organizationImportStub = { upload: sinon.stub() };

    organizationImportSavedStub = { upload: sinon.stub() };

    sinon
      .stub(OrganizationImport, 'create')
      .withArgs({ createdBy: userId, organizationId })
      .returns(organizationImportStub);

    organizationImportRepositoryStub = {
      save: sinon.stub(),
      getLastByOrganizationId: sinon.stub(),
    };
    organizationImportRepositoryStub.getLastByOrganizationId
      .withArgs(organizationId)
      .resolves(organizationImportSavedStub);
    siecleServiceStub.unzip.withArgs(filename).resolves({ file: filepath, directory: null });
    siecleServiceStub.detectEncoding.withArgs(filepath).resolves(encoding);
    importStorageStub.sendFile.withArgs({ filepath }).resolves(s3filename);
  });

  context('when extracted organizationLearners informations can be imported', function () {
    context('when the file is zipped', function () {
      let rmStub;
      beforeEach(function () {
        rmStub = sinon.stub(fs, 'rm');
      });

      it('should remove temporary directory', async function () {
        // given
        siecleServiceStub.unzip.withArgs(payload.path).resolves({ directory: 'tmp', file: filepath });

        // when
        await uploadSiecleFile({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
          eventBus: eventBusStub,
        });

        expect(rmStub).to.have.been.calledWithExactly('tmp', { recursive: true });
      });

      it('should log if removing temporary directory failed', async function () {
        // given
        siecleServiceStub.unzip.withArgs(payload.path).resolves({ directory: 'tmp', file: filepath });
        const rmError = new Error('rm');
        rmStub.rejects(rmError);
        const logErrorWithCorrelationIdsStub = sinon.stub();
        // when
        await uploadSiecleFile({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
          eventBus: eventBusStub,
          dependencies: { logErrorWithCorrelationIds: logErrorWithCorrelationIdsStub },
        });

        // then
        expect(logErrorWithCorrelationIdsStub).to.have.been.calledWithExactly(rmError);
        expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
          filename: s3filename,
          encoding,
          errors: [],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportSavedStub);
      });
    });
  });

  context('save import state in database', function () {
    it('should save import state', async function () {
      // when
      await uploadSiecleFile({
        userId,
        organizationId,
        payload,
        organizationImportRepository: organizationImportRepositoryStub,
        siecleService: siecleServiceStub,
        importStorage: importStorageStub,
        eventBus: eventBusStub,
      });

      // then
      expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
        filename: s3filename,
        encoding,
        errors: [],
      });
      expect(organizationImportRepositoryStub.save.getCall(0)).to.have.been.calledWithExactly(organizationImportStub);
      expect(organizationImportRepositoryStub.save.getCall(1)).to.have.been.calledWithExactly(
        organizationImportSavedStub,
      );
    });

    context('when there is an upload error', function () {
      it('should save organization import with error', async function () {
        //given
        const s3Error = new Error('s3_error');
        importStorageStub.sendFile.withArgs({ filepath }).rejects(s3Error);

        // when
        const error = await catchErr(uploadSiecleFile)({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
          eventBus: eventBusStub,
        });

        //then
        expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
          filename: undefined,
          encoding,
          errors: [error],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportSavedStub);
      });

      it('should save organizationImport if zip is invalid', async function () {
        //given
        const zipError = new Error('unzipError');
        siecleServiceStub.unzip.withArgs(filename).rejects(zipError);

        // when
        await catchErr(uploadSiecleFile)({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
          eventBus: eventBusStub,
        });

        //then
        expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
          filename: undefined,
          encoding: undefined,
          errors: [zipError],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportSavedStub);
      });

      it('should save organizationImport if there is detectEncoding fails', async function () {
        //given
        const encodingError = new Error('encoding');
        siecleServiceStub.detectEncoding.withArgs(filepath).rejects(encodingError);

        // when
        await catchErr(uploadSiecleFile)({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
          eventBus: eventBusStub,
        });

        //then
        expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
          filename: undefined,
          encoding: undefined,
          errors: [encodingError],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportSavedStub);
      });

      it('should save organization import with error when event publish fails', async function () {
        //given
        const expectedError = new Error('publishFails');
        eventBusStub.publish.reset();
        eventBusStub.publish.rejects(expectedError);

        // when
        await catchErr(uploadSiecleFile)({
          userId,
          organizationId,
          payload,
          organizationImportRepository: organizationImportRepositoryStub,
          siecleService: siecleServiceStub,
          importStorage: importStorageStub,
          eventBus: eventBusStub,
        });

        //then
        expect(organizationImportSavedStub.upload).to.have.been.calledWithExactly({
          filename: s3filename,
          encoding,
          errors: [expectedError],
        });
        expect(organizationImportRepositoryStub.save).to.have.been.calledWithExactly(organizationImportSavedStub);
      });
    });
  });
});
