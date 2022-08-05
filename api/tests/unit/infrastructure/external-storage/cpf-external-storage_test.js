const { expect, sinon } = require('../../../test-helper');
const cpfExternalStorage = require('../../../../lib/infrastructure/external-storage/cpf-external-storage');
const { cpf } = require('../../../../lib/config');
const s3Utils = require('../../../../lib/infrastructure/external-storage/s3-utils');
const _ = require('lodash');

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
      const writableStream = Symbol('writableStream');

      // when
      await cpfExternalStorage.upload({ filename: '', writableStream });

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
      const writableStream = Symbol('writableStream');

      // when
      await cpfExternalStorage.upload({ filename: 'filename.xml', writableStream });

      // then
      expect(s3Utils.startUpload).to.have.been.calledWith({
        client: s3ClientMock,
        filename: 'filename.xml',
        bucket: 'bucket',
        writableStream,
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
      const writableStream = Symbol('writableStream');

      // when
      await cpfExternalStorage.upload({ filename: 'filename.xml', writableStream });

      // then
      expect(doneStub).to.have.been.called;
    });
  });
});
