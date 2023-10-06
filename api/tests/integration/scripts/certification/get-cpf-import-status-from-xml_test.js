import { knex, expect, databaseBuilder } from '../../../test-helper.js';
import { main } from '../../../../scripts/certification/get-cpf-import-status-from-xml.js';
import { cpfImportStatus } from '../../../../lib/domain/models/CertificationCourse.js';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('Integration | Scripts | Certification | get-cpf-import-status-from-xml', function () {
  afterEach(async function () {
    await knex('compte-personnel-formation').delete();
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
        databaseBuilder.factory.buildComptePersonnelFormation({
          certificationCourseId: 1234,
          importStatus: cpfImportStatus.PENDING,
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 4567 });
        databaseBuilder.factory.buildComptePersonnelFormation({
          certificationCourseId: 4567,
          importStatus: cpfImportStatus.PENDING,
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 891011 });
        databaseBuilder.factory.buildComptePersonnelFormation({
          certificationCourseId: 891011,
          importStatus: cpfImportStatus.PENDING,
        });
        await databaseBuilder.commit();

        // when
        await main(xmlPath);

        // then
        const [certificationCourse1, certificationCourse2, certificationCourse3] = await knex(
          'compte-personnel-formation',
        )
          .select('certificationCourseId', 'importStatus')
          .whereIn('certificationCourseId', [1234, 4567, 891011])
          .orderBy('certificationCourseId', 'asc');
        expect(certificationCourse1).to.deep.equal({
          certificationCourseId: 1234,
          importStatus: cpfImportStatus.ERROR,
        });
        expect(certificationCourse2).to.deep.equal({
          certificationCourseId: 4567,
          importStatus: cpfImportStatus.SUCCESS,
        });
        expect(certificationCourse3).to.deep.equal({
          certificationCourseId: 891011,
          importStatus: cpfImportStatus.SUCCESS,
        });
      });
    });

    describe('when xml is empty', function () {
      it('should not update cpf import status', async function () {
        // given
        const xmlPath = `${__dirname}/files/xml/cpfImportLogEmpty.xml`;
        databaseBuilder.factory.buildCertificationCourse({ id: 1234 });
        databaseBuilder.factory.buildCertificationCourse({ id: 4567 });
        databaseBuilder.factory.buildCertificationCourse({ id: 891011 });
        await databaseBuilder.commit();

        // when
        await main(xmlPath);

        // then
        const results = await knex('compte-personnel-formation')
          .select('certificationCourseId')
          .whereIn('certificationCourseId', [1234, 4567, 891011]);
        expect(results).to.be.empty;
      });
    });
  });
});
