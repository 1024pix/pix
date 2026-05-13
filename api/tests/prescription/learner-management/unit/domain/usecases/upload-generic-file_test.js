import sinon from 'sinon';

import { AggregateImportError } from '../../../../../../src/prescription/learner-management/domain/errors.js';
import { ValidateGenericFileJob } from '../../../../../../src/prescription/learner-management/domain/models/jobs/ValidateGenericFileJob.js';
import { OrganizationImportStatus } from '../../../../../../src/prescription/learner-management/domain/models/OrganizationImportStatus.js';
import { uploadGenericFile } from '../../../../../../src/prescription/learner-management/domain/usecases/upload-generic-file.js';
import { GenericParser } from '../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/parsers/generic-parser.js';
import { expect } from '../../../../../test-helper.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | uploadGenericFile', function () {
  let organizationImportRepositoryStub,
    organizationLearnerImportFormatRepositoryStub,
    validateGenericFileJobRepositoryStub,
    organizationLearnerRepositoryStub,
    commonCsvLearnerParserStub,
    dependencieStub,
    importStorageStub,
    organizationImportStub,
    importFormat,
    dataBuffer,
    fileEncoding,
    organizationId,
    organizationImportId,
    payload,
    dataStream,
    s3Filepath,
    uploadedFilepath,
    organizationImportSavedStub,
    userId;

  beforeEach(function () {
    organizationId = 1234;
    userId = 4321;
    s3Filepath = Symbol('s3-path.csv');
    uploadedFilepath = Symbol('tmp-file.csv');
    fileEncoding = Symbol('file encoding');
    dataBuffer = Symbol('DataBuffer');
    dataStream = Symbol('DataStream');
    importFormat = Symbol('importFormat ');
    organizationImportId = Symbol('organizationImportdId');
    payload = { path: uploadedFilepath };

    importStorageStub = {
      sendFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    validateGenericFileJobRepositoryStub = {
      performAsync: sinon.stub(),
    };

    validateGenericFileJobRepositoryStub.performAsync
      .withArgs(new ValidateGenericFileJob({ organizationImportId }))
      .resolves();

    dependencieStub = {
      createReadStream: sinon.stub(),
      getDataBuffer: sinon.stub(),
    };

    organizationImportRepositoryStub = {
      save: sinon.stub(),
      getLastByOrganizationId: sinon.stub(),
    };

    organizationImportSavedStub = { id: organizationImportId, upload: sinon.stub() };

    organizationImportRepositoryStub.getLastByOrganizationId
      .withArgs(organizationId)
      .resolves(organizationImportSavedStub);

    commonCsvLearnerParserStub = {
      getEncoding: sinon.stub(),
    };

    organizationImportStub = {
      upload: sinon.stub(),
    };

    sinon.stub(GenericParser, 'buildParser');
    sinon
      .stub(OrganizationImportStatus, 'create')
      .withArgs({ createdBy: userId, organizationId })
      .returns(organizationImportStub);

    organizationLearnerImportFormatRepositoryStub = {
      get: sinon.stub(),
    };
  });

  context('success cases', function () {
    it('should upload the file', async function () {
      // given
      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);

      dependencieStub.createReadStream.withArgs(uploadedFilepath).returns(dataStream);
      dependencieStub.getDataBuffer.withArgs(dataStream).resolves(dataBuffer);

      GenericParser.buildParser.withArgs({ buffer: dataBuffer, importFormat }).returns(commonCsvLearnerParserStub);

      commonCsvLearnerParserStub.getEncoding.returns(fileEncoding);

      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filepath);

      // when
      await uploadGenericFile({
        payload,
        userId,
        organizationId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        validateGenericFileJobRepository: validateGenericFileJobRepositoryStub,
        dependencies: dependencieStub,
      });

      // then
      expect(organizationImportRepositoryStub.save.getCall(0)).to.have.been.calledWithExactly(organizationImportStub);
      expect(organizationImportRepositoryStub.save.getCall(1)).to.have.been.calledWithExactly(
        organizationImportSavedStub,
      );
      expect(importStorageStub.deleteFile.called, 'importStorageStub.delete').to.be.false;
    });
  });

  context(' error cases', function () {
    it('should upload errors', async function () {
      // given
      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(null);

      // when
      const sendError = await catchErr(uploadGenericFile)({
        payload,
        userId,
        organizationId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        validateGenericFileJobRepository: validateGenericFileJobRepositoryStub,
        dependencies: dependencieStub,
      });

      // then
      expect(sendError).to.instanceOf(AggregateImportError);
      expect(
        organizationImportStub.upload.calledOnceWithExactly({
          filename: undefined,
          encoding: undefined,
          errors: sendError.meta,
        }),
        'organizationImport.upload',
      ).to.be.true;
      expect(
        organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
        'organizationImportRepositoryStub.save',
      ).to.be.true;
    });

    context('error list', function () {
      it('should save the error', async function () {
        // given
        const error = new Error('Error Happened');

        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects(error);

        // when
        await catchErr(uploadGenericFile)({
          payload,
          userId,
          organizationId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          validateGenericFileJobRepository: validateGenericFileJobRepositoryStub,
          dependencies: dependencieStub,
        });

        expect(
          organizationImportStub.upload.calledOnceWithExactly({
            filename: undefined,
            encoding: undefined,
            errors: [error],
          }),
          'organizationImport.upload',
        ).to.be.true;
      });

      it('should save the errors', async function () {
        // given
        const error = new Error('Error Happened');

        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).rejects([error, error]);

        // when
        await catchErr(uploadGenericFile)({
          payload,
          userId,
          organizationId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
          validateGenericFileJobRepository: validateGenericFileJobRepositoryStub,
          dependencies: dependencieStub,
        });

        expect(
          organizationImportStub.upload.calledOnceWithExactly({
            filename: undefined,
            encoding: undefined,
            errors: [error, error],
          }),
          'organizationImport.upload',
        ).to.be.true;
      });
    });

    context('organizationRepository on Error', function () {
      it('delete file if exists', async function () {
        // given
        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(importFormat);

        dependencieStub.createReadStream.withArgs(uploadedFilepath).returns(dataStream);
        dependencieStub.getDataBuffer.withArgs(dataStream).resolves(dataBuffer);

        GenericParser.buildParser.withArgs({ buffer: dataBuffer, importFormat }).returns(commonCsvLearnerParserStub);

        commonCsvLearnerParserStub.getEncoding.returns(fileEncoding);

        importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filepath);

        organizationImportRepositoryStub.save.withArgs(organizationImportSavedStub).rejects();

        // when
        try {
          await uploadGenericFile({
            payload,
            userId,
            organizationId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
            validateGenericFileJobRepository: validateGenericFileJobRepositoryStub,
            dependencies: dependencieStub,
          });
        } catch {
          // do something
        }
        // then
        expect(importStorageStub.deleteFile.called, 'importStorageStub.delete').to.be.true;
      });

      it('not delete the file if not exists', async function () {
        // given
        organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(null);

        organizationImportRepositoryStub.save.withArgs(organizationImportStub).rejects();
        // when
        try {
          await uploadGenericFile({
            payload,
            userId,
            organizationId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
            validateGenericFileJobRepository: validateGenericFileJobRepositoryStub,
            dependencies: dependencieStub,
          });
        } catch {
          // do something
        }

        // then
        expect(importStorageStub.deleteFile.called, 'importStorageStub.delete').to.be.false;
      });
    });
  });
});
