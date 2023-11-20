import { nock } from '../../../../../test-helper.js';
import { uploadCpfFiles } from '../../../../../../src/certification/session/domain/usecases/upload-cpf-files.js';
import { Readable } from 'stream';
import { logger } from '../../../../../../src/shared/infrastructure/utils/logger.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';

describe('Integration | UseCase | upload-cpf-files', function () {
  after(function () {
    nock.cleanAll();
  });

  it('should upload a file', async function () {
    // given
    nock('http://cpf-exports.fake.endpoint.example.net:80')
      .put('/cpfExports.bucket/filename.xml?x-id=PutObject')
      .reply(200);
    const readableStream = new Readable({
      read() {
        this.push('fakeStream');
        this.push(null);
      },
    });

    // when, then
    await uploadCpfFiles({
      filename: 'filename.xml',
      readableStream,
      logger,
      cpfExportsStorage,
    });
  });
});
