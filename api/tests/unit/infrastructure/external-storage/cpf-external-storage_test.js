import { expect, sinon } from '../../../test-helper.js';
import * as cpfExternalStorage from '../../../../lib/infrastructure/external-storage/cpf-external-storage.js';
import { config } from '../../../../lib/config.js';
import _ from 'lodash';

const { cpf } = config;

describe('Unit | Infrastructure | external-storage | cpf-external-storage', function () {
  let s3Utils;
  let logger;

  beforeEach(function () {
    s3Utils = {
      getS3Client: sinon.stub(),
      startUpload: sinon.stub(),
      listFiles: sinon.stub(),
      preSignFiles: sinon.stub(),
    };
    logger = {
      trace: sinon.stub(),
    };
  });

  context('#upload', function () {
    it('should instantiate an Upload with the expected parameters', async function () {
      // given
      s3Utils.startUpload.returns({ done: _.noop, on: _.noop });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });
      const readableStream = Symbol('readableStream');

      // when
      await cpfExternalStorage.upload({ filename: 'filename.xml', readableStream, dependencies: { s3Utils, logger } });

      // then
      expect(s3Utils.startUpload).to.have.been.calledWithExactly({
        bucketConfig: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          endpoint: 'endpoint',
          region: 'region',
        },
        filename: 'filename.xml',
        bucket: 'bucket',
        readableStream,
      });
    });

    it('should call done() when the upload is successfully completed', async function () {
      // given
      const doneStub = sinon.stub();
      s3Utils.startUpload.returns({ done: doneStub, on: _.noop });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
      });
      const readableStream = Symbol('readableStream');

      // when
      await cpfExternalStorage.upload({
        bucketConfig: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          endpoint: 'endpoint',
          region: 'region',
          bucket: 'bucket',
        },
        filename: 'filename.xml',
        readableStream,
        dependencies: { s3Utils, logger },
      });

      // then
      expect(doneStub).to.have.been.called;
    });
  });

  context('#getPreSignUrlsOfFilesModifiedAfter', function () {
    it('should list files of the right bucket', async function () {
      // given
      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });

      // when
      await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date: null, dependencies: { s3Utils } });

      // then
      expect(s3Utils.listFiles).to.have.been.calledWithExactly({
        bucketConfig: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          endpoint: 'endpoint',
          region: 'region',
        },
        bucket: 'bucket',
      });
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

      s3Utils.listFiles.resolves({
        Contents: [...filesModifiedBeforeDate, ...filesModifiedAfterDate],
      });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
        preSignedExpiresIn: 3600,
      });

      // when
      await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date, dependencies: { s3Utils } });

      // then
      expect(s3Utils.preSignFiles).to.have.been.calledWithExactly({
        bucketConfig: {
          accessKeyId: 'accessKeyId',
          secretAccessKey: 'secretAccessKey',
          endpoint: 'endpoint',
          region: 'region',
        },
        bucket: 'bucket',
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

      s3Utils.listFiles.resolves({
        Contents: [...filesModifiedBeforeDate, ...filesModifiedAfterDate],
      });
      s3Utils.preSignFiles.resolves(['preSignedThirdFile', 'preSignedFourthFile']);

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });

      // when
      const result = await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date, dependencies: { s3Utils } });

      // then
      expect(result).to.deep.equals(['preSignedThirdFile', 'preSignedFourthFile']);
    });
  });
});
