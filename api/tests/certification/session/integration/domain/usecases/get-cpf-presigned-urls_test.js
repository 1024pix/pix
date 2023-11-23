import { databaseBuilder, expect } from '../../../../../test-helper.js';
import { getPreSignedUrls } from '../../../../../../src/certification/session/domain/usecases/get-cpf-presigned-urls.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-exports-storage.js';
import * as cpfExportRepository from '../../../../../../src/certification/session/infrastructure/repositories/cpf-export-repository.js';
import { CpfImportStatus } from '../../../../../../src/certification/session/domain/models/CpfImportStatus.js';

describe('Integration | UseCase | get-cpf-presigned-urls ', function () {
  context('#getPreSignedUrls', function () {
    it('should pre sign files', async function () {
      // given
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        filename: 'toto.xml',
        importStatus: CpfImportStatus.READY_TO_SEND,
      });
      await databaseBuilder.commit();

      // when
      const presignedUrls = await getPreSignedUrls({ cpfExportsStorage, cpfExportRepository });

      // then
      expect(presignedUrls).to.have.lengthOf(1);
      expect(presignedUrls[0]).to.contain('http://cpf-exports.fake.endpoint.example.net/cpfExports.bucket/toto.xml');
    });
  });
});
