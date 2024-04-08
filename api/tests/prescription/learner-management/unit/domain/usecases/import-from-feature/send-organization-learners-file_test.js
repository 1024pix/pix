import { AggregateImportError } from '../../../../../../../src/prescription/learner-management/domain/errors.js';
import { OrganizationImport } from '../../../../../../../src/prescription/learner-management/domain/models/OrganizationImport.js';
import { sendOrganizationLearnersFile } from '../../../../../../../src/prescription/learner-management/domain/usecases/import-from-feature/send-organization-learners-file.js';
import { CommonCsvLearnerParser } from '../../../../../../../src/prescription/learner-management/infrastructure/serializers/csv/common-csv-learner-parser.js';
import { catchErr, expect, sinon } from '../../../../../../test-helper.js';

describe('Unit | UseCase | sendOrganizationLearnersFile', function () {
  let organizationImportRepositoryStub,
    organizationLearnerImportFormatRepositoryStub,
    organizationLearnerRepositoryStub,
    commonCsvLearnerParserStub,
    dependencieStub,
    importStorageStub,
    organizationImportStub,
    importFormat,
    dataBuffer,
    fileEncoding,
    organizationId,
    payload,
    dataStream,
    s3Filepath,
    uploadedFilepath,
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
    payload = { path: uploadedFilepath };

    importStorageStub = {
      sendFile: sinon.stub(),
      deleteFile: sinon.stub(),
    };

    dependencieStub = {
      createReadStream: sinon.stub(),
      getDataBuffer: sinon.stub(),
    };

    organizationImportRepositoryStub = {
      save: sinon.stub(),
    };

    commonCsvLearnerParserStub = {
      getEncoding: sinon.stub(),
    };

    organizationImportStub = {
      upload: sinon.stub(),
    };

    sinon.stub(CommonCsvLearnerParser, 'buildParser');
    sinon
      .stub(OrganizationImport, 'create')
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

      CommonCsvLearnerParser.buildParser
        .withArgs({ buffer: dataBuffer, importFormat })
        .returns(commonCsvLearnerParserStub);

      commonCsvLearnerParserStub.getEncoding.returns(fileEncoding);

      importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filepath);

      // when
      await sendOrganizationLearnersFile({
        payload,
        userId,
        organizationId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
        dependencies: dependencieStub,
      });

      // then
      expect(
        organizationImportRepositoryStub.save.calledOnceWith(organizationImportStub),
        'organizationImportRepositoryStub.save',
      ).to.be.true;
      expect(importStorageStub.deleteFile.called, 'importStorageStub.delete').to.be.false;
    });
  });

  context(' error cases', function () {
    it('should upload errors', async function () {
      // given
      organizationLearnerImportFormatRepositoryStub.get.withArgs(organizationId).resolves(null);

      // when
      const sendError = await catchErr(sendOrganizationLearnersFile)({
        payload,
        userId,
        organizationId,
        importStorage: importStorageStub,
        organizationImportRepository: organizationImportRepositoryStub,
        organizationLearnerRepository: organizationLearnerRepositoryStub,
        organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
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
        await catchErr(sendOrganizationLearnersFile)({
          payload,
          userId,
          organizationId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
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
        await catchErr(sendOrganizationLearnersFile)({
          payload,
          userId,
          organizationId,
          importStorage: importStorageStub,
          organizationImportRepository: organizationImportRepositoryStub,
          organizationLearnerRepository: organizationLearnerRepositoryStub,
          organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
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

        CommonCsvLearnerParser.buildParser
          .withArgs({ buffer: dataBuffer, importFormat })
          .returns(commonCsvLearnerParserStub);

        commonCsvLearnerParserStub.getEncoding.returns(fileEncoding);

        importStorageStub.sendFile.withArgs({ filepath: payload.path }).resolves(s3Filepath);

        organizationImportRepositoryStub.save.withArgs(organizationImportStub).rejects();

        // when
        try {
          await sendOrganizationLearnersFile({
            payload,
            userId,
            organizationId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
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
          await sendOrganizationLearnersFile({
            payload,
            userId,
            organizationId,
            importStorage: importStorageStub,
            organizationImportRepository: organizationImportRepositoryStub,
            organizationLearnerRepository: organizationLearnerRepositoryStub,
            organizationLearnerImportFormatRepository: organizationLearnerImportFormatRepositoryStub,
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
