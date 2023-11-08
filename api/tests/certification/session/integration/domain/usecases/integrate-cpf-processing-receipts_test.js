import { expect, nock } from '../../../../../test-helper.js';
import { integrateCpfProccessingReceipts } from '../../../../../../src/certification/session/domain/usecases/integrate-cpf-processing-receipts.js';
import { cpfReceiptsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-receipts-storage.js';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | UseCase | integrate-cpf-processing-receipts ', function () {
  after(function () {
    nock.cleanAll();
  });

  context('#integrateCpfProccessingReceipts', function () {
    it('should fetch the CPF processing receipts', async function () {
      // given
      nock('http://cpf-receipts.fake.endpoint.example.net:80')
        .get('/cpfReceipts.bucket/?list-type=2')
        .replyWithFile(200, __dirname + '/files/xml/integrateCpfProccessingReceiptsListObjectsV2.xml', {
          'Content-Type': 'application/xml',
        });

      nock('http://cpf-receipts.fake.endpoint.example.net:80')
        .get(
          '/cpfReceipts.bucket/Accus%C3%A9%20de%20traitement_pix-cpf-export-20231016-223357_002.xml_20231025.xml?x-id=GetObject',
        )
        .reply(200);

      // when
      await integrateCpfProccessingReceipts({ cpfReceiptsStorage });

      // then
    });
  });
});
