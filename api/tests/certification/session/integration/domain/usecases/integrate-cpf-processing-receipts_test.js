import fs from 'fs';
import path from 'path';
import * as url from 'url';
import { knex, expect, nock, databaseBuilder } from '../../../../../test-helper.js';
import { integrateCpfProccessingReceipts } from '../../../../../../src/certification/session/domain/usecases/integrate-cpf-processing-receipts.js';
import { cpfReceiptsStorage } from '../../../../../../src/certification/session/infrastructure/storage/cpf-receipts-storage.js';
import * as cpfCertificationResultRepository from '../../../../../../src/certification/session/infrastructure/repositories/cpf-certification-result-repository.js';
import { CpfImportStatus } from '../../../../../../src/certification/session/domain/models/CpfImportStatus.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | UseCase | integrate-cpf-processing-receipts ', function () {
  after(function () {
    nock.cleanAll();
  });

  context('#integrateCpfProccessingReceipts', function () {
    it('should fetch the CPF infos from CPF processing receipts', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 1234 });
      databaseBuilder.factory.buildCertificationCourse({ id: 4567 });
      databaseBuilder.factory.buildCertificationCourse({ id: 891011 });
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        certificationCourseId: 1234,
        importStatus: CpfImportStatus.PENDING,
        filename: 'pix-cpf-export-20221003-324234.xml',
      });
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        certificationCourseId: 4567,
        importStatus: CpfImportStatus.PENDING,
        filename: 'pix-cpf-export-20221003-324234.xml',
      });
      databaseBuilder.factory.buildCertificationCoursesCpfInfos({
        certificationCourseId: 891011,
        importStatus: CpfImportStatus.PENDING,
        filename: 'pix-cpf-export-20221003-324234.xml',
      });
      await databaseBuilder.commit();

      nock('http://cpf-receipts.fake.endpoint.example.net:80')
        .get('/cpfReceipts.bucket/?list-type=2')
        .replyWithFile(200, __dirname + '/files/xml/integrateCpfProccessingReceiptsListObjectsV2.xml', {
          'Content-Type': 'application/xml',
        });

      nock('http://cpf-receipts.fake.endpoint.example.net:80')
        .get(
          '/cpfReceipts.bucket/Accus%C3%A9%20de%20traitement_pix-cpf-export-20231016-223357_002.xml_20231025.xml?x-id=GetObject',
        )
        .reply(200, () => fs.createReadStream(path.join(__dirname, 'files/xml/cpfImportLog.xml'), 'utf8'));

      // when
      await integrateCpfProccessingReceipts({ cpfReceiptsStorage, cpfCertificationResultRepository });

      // then
      const results = await knex('certification-courses-cpf-infos').select(
        'certificationCourseId',
        'importStatus',
        'filename',
      );
      expect(results).to.deep.equal([
        { certificationCourseId: 1234, filename: 'pix-cpf-export-20221003-324234.xml', importStatus: 'REJECTED' },
        { certificationCourseId: 4567, filename: 'pix-cpf-export-20221003-324234.xml', importStatus: 'SUCCESS' },
        { certificationCourseId: 891011, filename: 'pix-cpf-export-20221003-324234.xml', importStatus: 'SUCCESS' },
      ]);
    });
  });
});
