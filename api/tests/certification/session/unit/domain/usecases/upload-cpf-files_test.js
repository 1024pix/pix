import { expect, sinon } from '../../../../../test-helper.js';
import * as uploadCpfFiles from '../../../../../../src/certification/session/domain/usecases/upload-cpf-files.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { config } from '../../../../../../lib/config.js';
import _ from 'lodash';

const { cpf } = config;

describe('Unit | UseCase | upload-cpf-files', function () {
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
      await uploadCpfFiles.upload({
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
      await uploadCpfFiles.upload({
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
});
