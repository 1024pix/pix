import { expect, sinon } from '../../../../../test-helper.js';
import { uploadCpfFiles } from '../../../../../../src/certification/session/domain/usecases/upload-cpf-files.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';
import _ from 'lodash';

describe('Unit | UseCase | upload-cpf-files', function () {
  let logger;

  beforeEach(function () {
    logger = {
      trace: sinon.stub(),
    };
  });

  it('should upload a file with the expected parameters', async function () {
    // given
    const sendFileStub = sinon.stub(cpfExportsStorage, 'sendFile');
    sendFileStub.returns({ done: _.noop, on: _.noop });
    const readableStream = Symbol('readableStream');

    // when
    await uploadCpfFiles({
      filename: 'filename.xml',
      readableStream,
      logger,
      cpfExportsStorage,
    });

    // then
    expect(sendFileStub).to.have.been.calledWithExactly({
      filename: 'filename.xml',
      readableStream,
    });
  });
});
