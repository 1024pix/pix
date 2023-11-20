import { expect, nock } from '../../../../../test-helper.js';
import { getPreSignedUrls } from '../../../../../../src/certification/session/domain/usecases/get-cpf-presigned-urls.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | UseCase | get-cpf-presigned-urls ', function () {
  after(function () {
    nock.cleanAll();
  });

  context('#getPreSignedUrls', function () {
    it('should pre sign files modified after a date', async function () {
      // given
      nock('http://cpf-exports.fake.endpoint.example.net:80')
        .get('/cpfExports.bucket/?list-type=2')
        .replyWithFile(200, __dirname + '/files/xml/getPreSignedUrlsListObjectsV2.xml', {
          'Content-Type': 'application/xml',
        });
      const date = new Date('2022-12-31');

      // when
      const presignedUrls = await getPreSignedUrls({ date, cpfExportsStorage });

      // then
      expect(presignedUrls).to.have.lengthOf(1);
      expect(presignedUrls[0]).to.contain(
        'http://cpf-exports.fake.endpoint.example.net/cpfExports.bucket/pix-cpf-export-20231016-223357_002.xml_20231025.xml.gz',
      );
    });
  });
});
