import { expect, sinon } from '../../../../../test-helper.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { CpfReceiptsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-receipts-storage.js';
import { config } from '../../../../../../src/shared/config.js';
import { CpfReceipt } from '../../../../../../src/certification/session/domain/models/CpfReceipt.js';

describe('Unit | Storage | CpfReceiptsStorage', function () {
  it('should create a S3 client', async function () {
    // given
    const clientStub = sinon.stub(S3ObjectStorageProvider, 'createClient');

    // when
    new CpfReceiptsStorage();

    // then
    expect(clientStub).to.have.been.calledWithExactly({
      ...config.cpf.storage.cpfReceipts.client,
    });
  });

  describe('#findAll', function () {
    it('should return the list of CPF receipts', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const cpfReceiptsStorage = new CpfReceiptsStorage();
      providerStub.listFiles.resolves({ Contents: [{ Key: 'hyperdimension_galaxy.xml' }] });

      // when
      const [results] = await cpfReceiptsStorage.findAll();

      // then
      expect(results).to.deepEqualInstance(new CpfReceipt({ filename: 'hyperdimension_galaxy.xml' }));
    });
  });
});
