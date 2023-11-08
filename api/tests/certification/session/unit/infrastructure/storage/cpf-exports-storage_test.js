import { expect, sinon } from '../../../../../test-helper.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { CpfExportsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';
import { config } from '../../../../../../src/shared/config.js';
import dayjs from 'dayjs';

describe('Unit | Storage | CpfExportsStorage', function () {
  it('should create a S3 client', async function () {
    // given
    const clientStub = sinon.stub(S3ObjectStorageProvider, 'createClient');

    // when
    new CpfExportsStorage();

    // then
    expect(clientStub).to.have.been.calledWithExactly(config.cpf.storage.cpfExports.client);
  });

  describe('#findAll', function () {
    it('should return the list of CPF exports', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const cpfExportsStorage = new CpfExportsStorage();
      providerStub.listFiles.resolves({
        Contents: [{ Key: 'Osaki_Ni_Shitsurei_Shimasu', LastModified: '2013-09-17T18:07:53.000Z' }],
      });

      // when
      const results = await cpfExportsStorage.findAll();

      // then
      const expectedDate = dayjs('2013-09-17T18:07:53.000Z').toDate();
      expect(results).to.deep.equal([{ filename: 'Osaki_Ni_Shitsurei_Shimasu', lastModifiedDate: expectedDate }]);
    });
  });

  describe('#preSignFiles', function () {
    it('should return the files pre signed', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const cpfExportsStorage = new CpfExportsStorage();
      providerStub.preSignFile.resolves('presigned_we_love_sweets');

      // when
      const results = await cpfExportsStorage.preSignFiles({ keys: [{ Key: 'we_love_sweets' }], expiresIn: 3600 });

      // then
      expect(results).to.deep.equal(['presigned_we_love_sweets']);
    });
  });
});
