import { CertificationDataset } from '../../../../../src/maddo/domain/models/men/dashboard/CertificationDataset.js';
import { findAll } from '../../../../../src/maddo/infrastructure/repositories/certification-dataset-repository.js';
import { expect } from '../../../../test-helper.js';
import { datamartBuilder } from '../../../../tooling/databases.js';

describe('Maddo | Infrastructure | Repositories | Integration | CertificationDataset', function () {
  describe('#findAll', function () {
    it('returns dataset sorted by schoolUai', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_B',
      });
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_A',
      });
      await datamartBuilder.commit();

      // when
      const { models } = await findAll();

      // then
      expect(models[0].schoolUai).to.equal('UAI_A');
      expect(models[1].schoolUai).to.equal('UAI_B');
      expect(models[0]).to.be.instanceOf(CertificationDataset);
    });

    it('paginates results and returns correct meta', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_A',
      });
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_B',
      });
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI_C',
      });
      await datamartBuilder.commit();

      // when
      const { models, meta } = await findAll({ page: { number: 2, size: 2 } });

      // then
      expect(models).to.have.length(1);
      expect(models[0].schoolUai).to.equal('UAI_C');
      expect(models[0]).to.be.instanceOf(CertificationDataset);
      expect(meta).to.deep.equal({ page: 2, pageSize: 2, pageCount: 2 });
    });

    it('maps all columns to the domain model', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardCertificationDataset({
        schoolUai: 'UAI001',
        schoolYear: 2025,
        academieName: 'Paris',
        schoolName: 'Lycée Test',
        provinceCode: '075',
        schoolYearGroup: 'Terminale',
        validatedCertificationCount: 12,
        certificationCount: 20,
        averagePixScore: 420.5,
        competenceCode: '1.1',
        avgCompetenceLevel: 3.5,
        updatedAt: '2026-07-01',
      });
      await datamartBuilder.commit();

      // when
      const { models } = await findAll();

      // then
      const stat = models[0];
      expect(stat.schoolUai).to.equal('UAI001');
      expect(stat.schoolYear).to.equal(2025);
      expect(stat.academieName).to.equal('Paris');
      expect(stat.schoolName).to.equal('Lycée Test');
      expect(stat.provinceCode).to.equal('075');
      expect(stat.schoolYearGroup).to.equal('Terminale');
      expect(stat.validatedCertificationCount).to.equal(12);
      expect(stat.certificationCount).to.equal(20);
      expect(stat.averagePixScore).to.equal(420.5);
      expect(stat.competenceCode).to.equal('1.1');
      expect(stat.avgCompetenceLevel).to.equal(3.5);
      expect(stat.updatedAt).to.deep.equal('2026-07-01');
    });
  });
});
