import { CpfImportStatus } from '../../../../../../src/certification/session-management/domain/models/CpfImportStatus.js';
import { getPreSignedUrls } from '../../../../../../src/certification/session-management/domain/usecases/get-cpf-presigned-urls.js';
import * as cpfExportRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/cpf-export-repository.js';
import { cpfExportsStorage } from '../../../../../../src/certification/session-management/infrastructure/storage/cpf-exports-storage.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

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
