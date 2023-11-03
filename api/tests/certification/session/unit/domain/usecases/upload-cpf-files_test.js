import { expect, sinon } from '../../../../../test-helper.js';
import { uploadCpfFiles } from '../../../../../../src/certification/session/domain/usecases/upload-cpf-files.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import _ from 'lodash';

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
      const readableStream = Symbol('readableStream');

      // when
      await uploadCpfFiles({
        filename: 'filename.xml',
        readableStream,
        logger,
        dependencies: { S3ObjectStorageProvider },
      });

      // then
      expect(startUploadStub).to.have.been.calledWithExactly({
        filename: 'filename.xml',
        readableStream,
      });
    });
  });
});
