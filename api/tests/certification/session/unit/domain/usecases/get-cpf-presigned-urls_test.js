import { expect, sinon } from '../../../../../test-helper.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';
import { getPreSignedUrls } from '../../../../../../src/certification/session/domain/usecases/get-cpf-presigned-urls.js';

describe('Unit | UseCase | get-cpf-presigned-urls ', function () {
  context('#getPreSignedUrls', function () {
    it('should pre sign found files', async function () {
      // given
      const files = [{ filename: 'thirdFile' }, { filename: 'fourthFile' }];
      const listFilesStub = sinon.stub(cpfExportsStorage, 'findAll');
      listFilesStub.resolves(files);
      const preSignFilesStub = sinon.stub(cpfExportsStorage, 'preSignFiles');

      // when
      await getPreSignedUrls({ cpfExportsStorage });

      // then
      expect(preSignFilesStub).to.have.been.calledWithExactly({
        keys: ['thirdFile', 'fourthFile'],
        expiresIn: 3600,
      });
    });
  });
});
