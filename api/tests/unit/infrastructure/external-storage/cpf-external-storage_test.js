const { expect, sinon } = require('../../../test-helper');
const { cpf } = require('../../../../lib/config');
const proxyquire = require('proxyquire');

describe('Unit | Infrastructure | external-storage | cpf-external-storage', function () {
  context('#upload', function () {
    it('it should instantiate a properly configured S3 client', function () {
      // given
      const constructorStub = sinon.stub();
      const cpfExternalStorage = proxyquire('../../../../lib/infrastructure/external-storage/cpf-external-storage', {
        '@aws-sdk/client-s3': {
          S3Client: class S3ClientMock {
            constructor(...args) {
              constructorStub(...args);
            }
          },
        },
      });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });
      const writableStream = Symbol('writableStream');

      // when
      cpfExternalStorage.upload({ filename: '', writableStream });

      // then
      expect(constructorStub).to.have.been.calledWith({
        credentials: { accessKeyId: 'accessKeyId', secretAccessKey: 'secretAccessKey' },
        endpoint: 'endpoint',
        region: 'region',
      });
    });

    it('it should instantiate an Upload with the expected parameters', function () {
      // given
      const constructorStub = sinon.stub();
      const S3ClientMock = class S3ClientMock {};
      const cpfExternalStorage = proxyquire('../../../../lib/infrastructure/external-storage/cpf-external-storage', {
        '@aws-sdk/client-s3': {
          S3Client: S3ClientMock,
        },
        '@aws-sdk/lib-storage': {
          Upload: class UploadMock {
            constructor(...args) {
              constructorStub(...args);
            }
            on = () => {};
            done = () => {};
          },
        },
      });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });
      const writableStream = Symbol('writableStream');

      // when
      cpfExternalStorage.upload({ filename: 'filename.xml', writableStream });

      // then
      expect(constructorStub).to.have.been.calledWith({
        client: sinon.match(new S3ClientMock()),
        params: { Key: 'filename.xml', Bucket: 'bucket', ContentType: 'text/xml', Body: writableStream },
      });
    });

    it('it should call done() when the upload is successfully completed', function () {
      // given
      const doneStub = sinon.stub();
      const cpfExternalStorage = proxyquire('../../../../lib/infrastructure/external-storage/cpf-external-storage', {
        '@aws-sdk/client-s3': {
          S3Client: class S3ClientMock {},
        },
        '@aws-sdk/lib-storage': {
          Upload: class UploadMock {
            on = () => {};
            done = doneStub;
          },
        },
      });

      sinon.stub(cpf, 'storage').value({
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'secretAccessKey',
        endpoint: 'endpoint',
        region: 'region',
        bucket: 'bucket',
      });
      const writableStream = Symbol('writableStream');

      // when
      cpfExternalStorage.upload({ filename: 'filename.xml', writableStream });

      // then
      expect(doneStub).to.have.been.called;
    });
  });
});
