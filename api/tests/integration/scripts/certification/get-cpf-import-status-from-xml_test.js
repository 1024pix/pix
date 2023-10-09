import { knex, expect, databaseBuilder } from '../../../test-helper.js';
import { main } from '../../../../scripts/certification/get-cpf-import-status-from-xml.js';
import { ImportStatus } from '../../../../src/certification/compte-personnel-formation/domain/models/ImportStatus.js';
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
          importStatus: ImportStatus.PENDING,
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 4567 });
        databaseBuilder.factory.buildComptePersonnelFormation({
          certificationCourseId: 4567,
          importStatus: ImportStatus.PENDING,
        });
        databaseBuilder.factory.buildCertificationCourse({ id: 891011 });
        databaseBuilder.factory.buildComptePersonnelFormation({
          certificationCourseId: 891011,
          importStatus: ImportStatus.PENDING,
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
          importStatus: ImportStatus.ERROR,
        });
        expect(certificationCourse2).to.deep.equal({
          certificationCourseId: 4567,
          importStatus: ImportStatus.SUCCESS,
        });
        expect(certificationCourse3).to.deep.equal({
          certificationCourseId: 891011,
          importStatus: ImportStatus.SUCCESS,
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
