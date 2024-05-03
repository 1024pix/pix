import { CpfImportStatus } from '../../../../../../src/certification/session-management/domain/models/CpfImportStatus.js';
import { getPreSignedUrls } from '../../../../../../src/certification/session-management/domain/usecases/get-cpf-presigned-urls.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session-management/infrastructure/storage/cpf-exports-storage.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | get-cpf-presigned-urls ', function () {
  context('#getPreSignedUrls', function () {
    it('should pre sign found files', async function () {
      // given
      const cpfExportRepository = { findFileNamesByStatus: sinon.stub() };
      const filenames = ['thirdFile', 'fourthFile'];
      cpfExportRepository.findFileNamesByStatus
        .withArgs({ cpfImportStatus: CpfImportStatus.READY_TO_SEND })
        .resolves(filenames);
      const preSignFilesStub = sinon.stub(cpfExportsStorage, 'preSignFiles');

      // when
      await getPreSignedUrls({ cpfExportsStorage, cpfExportRepository });

      // then
      expect(preSignFilesStub).to.have.been.calledWithExactly({
        keys: ['thirdFile', 'fourthFile'],
      });
    });
  });
});
