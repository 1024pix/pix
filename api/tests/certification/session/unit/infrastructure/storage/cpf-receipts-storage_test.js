import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { expect, sinon } from '../../../../../test-helper.js';
import { S3ObjectStorageProvider } from '../../../../../../src/shared/storage/infrastructure/providers/S3ObjectStorageProvider.js';
import { CpfReceiptsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-receipts-storage.js';
import { config } from '../../../../../../src/shared/config.js';
import { CpfReceipt } from '../../../../../../src/certification/session/domain/models/CpfReceipt.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

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

  describe('#getCpfInfosByReceipt', function () {
    it('should return the CPF infos from CPF receipt file', async function () {
      // given
      const providerStub = sinon.createStubInstance(S3ObjectStorageProvider);
      sinon.stub(S3ObjectStorageProvider, 'createClient').returns(providerStub);
      const cpfReceiptsStorage = new CpfReceiptsStorage();
      providerStub.readFile.resolves({
        Body: fs.createReadStream(
          path.join(
            __dirname,
            '../deserializers/xml/files/Accuse_de_traitement_pix-cpf-export-20231016-223239.xml_20231018.xml',
          ),
          'utf8',
        ),
      });
      const cpfReceipt = new CpfReceipt({ filename: 'neet_game' });

      // when
      const results = await cpfReceiptsStorage.getCpfInfosByReceipt({ cpfReceipt });

      // then
      expect(providerStub.readFile).to.have.been.calledOnceWithExactly({ key: 'neet_game' });
      expect(results).to.deep.equal([
        { certificationCourseId: '1979262', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'REJECTED' },
        { certificationCourseId: '1996215', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'REJECTED' },
        { certificationCourseId: '1983189', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'SUCCESS' },
        { certificationCourseId: '1968666', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'SUCCESS' },
        { certificationCourseId: '1964200', filename: 'pix-cpf-export-20231016-223239.xml', importStatus: 'SUCCESS' },
      ]);
    });
  });
});
