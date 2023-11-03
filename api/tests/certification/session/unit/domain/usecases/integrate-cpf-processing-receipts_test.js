import { expect, sinon } from '../../../../../test-helper.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { integrateCpfProccessingReceipts } from '../../../../../../src/certification/session/domain/usecases/integrate-cpf-processing-receipts.js';
import { config } from '../../../../../../src/shared/config.js';

describe('Unit | UseCase | integrate-cpf-processing-receipts ', function () {
  context('#integrateCpfProccessingReceipts', function () {
    it('should create a S3 client', async function () {
      // given
      const clientStub = sinon.stub(S3ObjectStorageProvider, 'createClient');

      // when
      await integrateCpfProccessingReceipts({
        dependencies: {
          S3ObjectStorageProvider,
        },
      });

      // then
      expect(clientStub).to.have.been.calledWithExactly({
        ...config.cpf.storage.cpfReceipts.client,
      });
    });
  });
});
