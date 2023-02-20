import { knex, expect, databaseBuilder } from '../../../test-helper';
import { main } from '../../../../scripts/certification/get-cpf-import-status-from-xml';
import { cpfImportStatus } from '../../../../lib/domain/models/CertificationCourse';

describe('Integration | Scripts | Certification | get-cpf-import-status-from-xml', function () {
  afterEach(async function () {
    await knex('certification-courses').delete();
    await knex('sessions').delete();
    await knex('users').delete();
  });
  describe('#main', function () {
    describe('when xml is not empty', function () {
      it('should update cpf import status', async function () {
        // given
        const xmlPath = `${__dirname}/files/xml/cpfImportLog.xml`;
        databaseBuilder.factory.buildCertificationCourse({ id: 1234, cpfImportStatus: null });
        databaseBuilder.factory.buildCertificationCourse({ id: 4567, cpfImportStatus: null });
        databaseBuilder.factory.buildCertificationCourse({ id: 891011, cpfImportStatus: null });
        await databaseBuilder.commit();

        // when
        await main(xmlPath);

        // then
        const [certificationCourse1, certificationCourse2, certificationCourse3] = await knex('certification-courses')
          .select('id', 'cpfImportStatus')
          .whereIn('id', [1234, 4567, 891011]);
        expect(certificationCourse1).to.deep.equal({
          id: 1234,
          cpfImportStatus: cpfImportStatus.ERROR,
        });
        expect(certificationCourse2).to.deep.equal({
          id: 4567,
          cpfImportStatus: cpfImportStatus.SUCCESS,
        });
        expect(certificationCourse3).to.deep.equal({
          id: 891011,
          cpfImportStatus: cpfImportStatus.SUCCESS,
        });
      });
    });

    describe('when xml is empty', function () {
      it('should not update cpf import status', async function () {
        // given
        const xmlPath = `${__dirname}/files/xml/cpfImportLogEmpty.xml`;
        databaseBuilder.factory.buildCertificationCourse({ id: 1234, cpfImportStatus: null });
        databaseBuilder.factory.buildCertificationCourse({ id: 4567, cpfImportStatus: null });
        databaseBuilder.factory.buildCertificationCourse({ id: 891011, cpfImportStatus: null });
        await databaseBuilder.commit();

        // when
        await main(xmlPath);

        // then
        const [certificationCourse1, certificationCourse2, certificationCourse3] = await knex('certification-courses')
          .select('id', 'cpfImportStatus')
          .whereIn('id', [1234, 4567, 891011])
          .orderBy('id');
        expect(certificationCourse1).to.deep.equal({
          id: 1234,
          cpfImportStatus: null,
        });
        expect(certificationCourse2).to.deep.equal({
          id: 4567,
          cpfImportStatus: null,
        });
        expect(certificationCourse3).to.deep.equal({
          id: 891011,
          cpfImportStatus: null,
        });
      });
    });
  });
});
