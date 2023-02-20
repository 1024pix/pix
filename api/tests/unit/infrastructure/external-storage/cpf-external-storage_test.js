import { expect, sinon } from '../../../test-helper';
import cpfExternalStorage from '../../../../lib/infrastructure/external-storage/cpf-external-storage';
import { cpf } from '../../../../lib/config';
import s3Utils from '../../../../lib/infrastructure/external-storage/s3-utils';
import _ from 'lodash';

describe('Unit | Infrastructure | external-storage | cpf-external-storage', function () {
  context('#upload', function () {
    it('should instantiate a properly configured S3 client', async function () {
      // given
      sinon.stub(s3Utils, 'getS3Client');
      sinon.stub(s3Utils, 'startUpload');
      s3Utils.startUpload.returns({ done: _.noop, on: _.noop });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
      });
      const readableStream = Symbol('readableStream');

      // when
      await cpfExternalStorage.upload({ filename: '', readableStream });

      // then
      expect(s3Utils.getS3Client).to.have.been.calledWith({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
      });
    });

    it('should instantiate an Upload with the expected parameters', async function () {
      // given
      sinon.stub(s3Utils, 'getS3Client');
      const s3ClientMock = Symbol('S3Client');
      s3Utils.getS3Client.returns(s3ClientMock);
      sinon.stub(s3Utils, 'startUpload');
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
      await cpfExternalStorage.upload({ filename: 'filename.xml', readableStream });

      // then
      expect(s3Utils.startUpload).to.have.been.calledWith({
        client: s3ClientMock,
        filename: 'filename.xml',
        bucket: 'bucket',
        readableStream,
      });
    });

    it('should call done() when the upload is successfully completed', async function () {
      // given
      sinon.stub(s3Utils, 'getS3Client');
      sinon.stub(s3Utils, 'startUpload');
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
      await cpfExternalStorage.upload({ filename: 'filename.xml', readableStream });

      // then
      expect(doneStub).to.have.been.called;
    });
  });

  context('#getFilesModifiedAfter', function () {
    it('should instantiate a properly configured S3 client', async function () {
      // given
      sinon.stub(s3Utils, 'getS3Client');
      sinon.stub(s3Utils, 'listFiles');
      sinon.stub(s3Utils, 'preSignFiles');

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
      });

      // when
      await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date: null });

      // then
      expect(s3Utils.getS3Client).to.have.been.calledWith({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
      });
    });

    it('should list files of the right bucket', async function () {
      // given
      sinon.stub(s3Utils, 'getS3Client');
      sinon.stub(s3Utils, 'listFiles');
      sinon.stub(s3Utils, 'preSignFiles');

      const s3ClientMock = Symbol('s3Client');
      s3Utils.getS3Client.returns(s3ClientMock);

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });

      // when
      await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date: null });

      // then
      expect(s3Utils.listFiles).to.have.been.calledWith({ client: s3ClientMock, bucket: 'bucket' });
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

      sinon.stub(s3Utils, 'getS3Client');
      sinon.stub(s3Utils, 'listFiles');
      sinon.stub(s3Utils, 'preSignFiles');

      const s3ClientMock = Symbol('s3Client');
      s3Utils.getS3Client.returns(s3ClientMock);

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
      await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date });

      // then
      expect(s3Utils.preSignFiles).to.have.been.calledWith({
        client: s3ClientMock,
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

      sinon.stub(s3Utils, 'getS3Client');
      sinon.stub(s3Utils, 'listFiles');
      sinon.stub(s3Utils, 'preSignFiles');

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
      const result = await cpfExternalStorage.getPreSignUrlsOfFilesModifiedAfter({ date });

      // then
      expect(result).to.deep.equals(['preSignedThirdFile', 'preSignedFourthFile']);
    });
  });
});
