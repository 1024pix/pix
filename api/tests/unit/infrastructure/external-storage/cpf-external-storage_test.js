import { expect, sinon } from '../../../test-helper.js';
import * as cpfExternalStorage from '../../../../lib/infrastructure/external-storage/cpf-external-storage.js';
import { S3ObjectStorageProvider } from '../../../../lib/infrastructure/external-storage/s3-utils.js';
import { config } from '../../../../lib/config.js';
import _ from 'lodash';

const { cpf } = config;

describe('Unit | Infrastructure | external-storage | cpf-external-storage', function () {
  let logger;

  beforeEach(function () {
    logger = {
      trace: sinon.stub(),
    };
  });

  context('#upload', function () {
    it('should instantiate an Upload with the expected parameters', async function () {
      // given
      const startUploadStub = sinon.stub(S3ObjectStorageProvider.prototype, 'startUpload');
      startUploadStub.returns({ done: _.noop, on: _.noop });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });
      const readableStream = Symbol('readableStream');

      // when
      await cpfExternalStorage.upload({
        filename: 'filename.xml',
        readableStream,
        dependencies: { S3ObjectStorageProvider, logger },
      });

      // then
      expect(startUploadStub).to.have.been.calledWithExactly({
        filename: 'filename.xml',
        readableStream,
      });
    });

    it('should call done() when the upload is successfully completed', async function () {
      // given
      const startUploadStub = sinon.stub(S3ObjectStorageProvider.prototype, 'startUpload');
      const doneStub = sinon.stub();
      startUploadStub.returns({ done: doneStub, on: _.noop });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });
      const readableStream = Symbol('readableStream');

      // when
      await cpfExternalStorage.upload({
        filename: 'filename.xml',
        readableStream,
        dependencies: { S3ObjectStorageProvider, logger },
      });

      // then
      expect(startUploadStub).to.have.been.calledWithExactly({
        filename: 'filename.xml',
        readableStream,
      });
      expect(doneStub).to.have.been.called;
    });
  });

  context('#getPreSignUrlsOfFilesModifiedAfter', function () {
    it('should list files of the right bucket', async function () {
      // given
      const listFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'listFiles');
      sinon.stub(S3ObjectStorageProvider.prototype, 'preSignFiles');
      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });

      // when
      await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({
        date: null,
        dependencies: { S3ObjectStorageProvider },
      });

      // then
      expect(listFilesStub).to.have.been.calledOnce;
    });

    it('should pre sign files modified after a date', async function () {
      // given
      const date = '2022-03-01';
      const filesModifiedBeforeDate = [
        { Key: 'firstFile', LastModified: '2022-02-14' },
        { Key: 'secondFile', LastModified: '2022-02-17' },
      ];
      const filesModifiedAfterDate = [
        { Key: 'thirdFile', LastModified: '2022-03-01' },
        { Key: 'fourthFile', LastModified: '2022-03-04' },
      ];
      const listFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'listFiles');
      listFilesStub.resolves({ Contents: [...filesModifiedBeforeDate, ...filesModifiedAfterDate] });
      const preSignFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'preSignFiles');

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
        preSignedExpiresIn: 3600,
      });

      // when
      await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date, dependencies: { S3ObjectStorageProvider } });

      // then
      expect(preSignFilesStub).to.have.been.calledWithExactly({
        keys: ['thirdFile', 'fourthFile'],
        expiresIn: 3600,
      });
    });

    it('should return pre signed url of files modified after a date', async function () {
      // given
      const date = '2022-03-01';
      const filesModifiedBeforeDate = [
        { Key: 'firstFile', LastModified: '2022-02-14' },
        { Key: 'secondFile', LastModified: '2022-02-17' },
      ];
      const filesModifiedAfterDate = [
        { Key: 'thirdFile', LastModified: '2022-03-01' },
        { Key: 'fourthFile', LastModified: '2022-03-04' },
      ];

      const listFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'listFiles');
      listFilesStub.resolves({
        Contents: [...filesModifiedBeforeDate, ...filesModifiedAfterDate],
      });
      const preSignFilesStub = sinon.stub(S3ObjectStorageProvider.prototype, 'preSignFiles');
      preSignFilesStub.resolves(['preSignedThirdFile', 'preSignedFourthFile']);

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });

      // when
      const result = await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({
        date,
        dependencies: { S3ObjectStorageProvider },
      });

      // then
      expect(result).to.deep.equals(['preSignedThirdFile', 'preSignedFourthFile']);
    });
  });
});
