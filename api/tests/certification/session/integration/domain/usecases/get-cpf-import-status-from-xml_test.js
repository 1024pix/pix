import { knex, expect, databaseBuilder } from '../../../../../test-helper.js';
import { main } from '../../../../../../scripts/certification/get-cpf-import-status-from-xml.js';
import { CpfImportStatus } from '../../../../../../src/certification/session/domain/models/CpfImportStatus.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Scripts | Certification | get-cpf-import-status-from-xml', function () {
  afterEach(async function () {
    await knex('certification-courses-cpf-infos').delete();
    await knex('certification-courses').delete();
    await knex('sessions').delete();
    await knex('users').delete();
  });
  describe('#main', function () {
    describe('when xml is not empty', function () {
      it('should update cpf import status', async function () {
        // given
        const xmlPath = `${__dirname}/files/xml/cpfImportLog.xml`;
        databaseBuilder.factory.buildCertificationCourse({ id: 1234 });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          certificationCourseId: 1234,
          importStatus: CpfImportStatus.PENDING,
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 4567 });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          certificationCourseId: 4567,
          importStatus: CpfImportStatus.PENDING,
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 891011 });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          certificationCourseId: 891011,
          importStatus: CpfImportStatus.PENDING,
        });
        await databaseBuilder.commit();

        // when
        await main(xmlPath);

        // then
        const [certificationCourse1, certificationCourse2, certificationCourse3] = await knex(
          'certification-courses-cpf-infos',
        )
          .select('certificationCourseId', 'importStatus')
          .whereIn('certificationCourseId', [1234, 4567, 891011])
          .orderBy('certificationCourseId', 'asc');
        expect(certificationCourse1).to.deep.equal({
          certificationCourseId: 1234,
          importStatus: CpfImportStatus.ERROR,
        });
        expect(certificationCourse2).to.deep.equal({
          certificationCourseId: 4567,
          importStatus: CpfImportStatus.SUCCESS,
        });
        expect(certificationCourse3).to.deep.equal({
          certificationCourseId: 891011,
          importStatus: CpfImportStatus.SUCCESS,
        });
      });
    });

    describe('when xml is empty', function () {
      it('should not update cpf import status', async function () {
        // given
        const xmlPath = `${__dirname}/files/xml/cpfImportLogEmpty.xml`;
        databaseBuilder.factory.buildCertificationCourse({ id: 1234 });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          certificationCourseId: 1234,
          importStatus: CpfImportStatus.PENDING,
          filename: 'cpf.gzip',
        });

        databaseBuilder.factory.buildCertificationCourse({ id: 4567 });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          certificationCourseId: 4567,
          importStatus: CpfImportStatus.ERROR,
          filename: 'cpf.gzip',
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 891011 });
        databaseBuilder.factory.buildCertificationCoursesCpfInfos({
          certificationCourseId: 891011,
          importStatus: CpfImportStatus.READY_TO_SEND,
          filename: 'cpf.gzip',
        });

        await databaseBuilder.commit();

        // when
        await main(xmlPath);

        // then
        const results = await knex('certification-courses-cpf-infos')
          .select('certificationCourseId', 'importStatus', 'filename')
          .whereIn('certificationCourseId', [1234, 4567, 891011]);
        expect(results).to.deep.equal([
          { certificationCourseId: 1234, importStatus: 'PENDING', filename: 'cpf.gzip' },
          { certificationCourseId: 4567, importStatus: 'ERROR', filename: 'cpf.gzip' },
          { certificationCourseId: 891011, importStatus: 'READY_TO_SEND', filename: 'cpf.gzip' },
        ]);
      });
    });
  });
});
