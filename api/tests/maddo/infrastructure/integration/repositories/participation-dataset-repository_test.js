import { ParticipationDataset } from '../../../../../src/maddo/domain/models/men/dashboard/ParticipationDataset.js';
import { findAll } from '../../../../../src/maddo/infrastructure/repositories/participation-dataset-repository.js';
import { expect } from '../../../../test-helper.js';
import { datamartBuilder } from '../../../../tooling/databases.js';

describe('Maddo | Infrastructure | Repositories | Integration | ParticipationDataset', function () {
  describe('#findAll', function () {
    it('returns dataset sorted by academieName, provinceCode, schoolUai, schoolYearGroup then competenceCode', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        academieName: 'Amiens',
        provinceCode: '080',
        schoolUai: 'UAI_B',
        schoolYearGroup: 'Terminale',
        competenceCode: '2.1',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        academieName: 'Nantes',
        provinceCode: '049',
        schoolUai: 'UAI_B',
        schoolYearGroup: 'Terminale',
        competenceCode: '2.1',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        academieName: 'Nantes',
        provinceCode: '085',
        schoolUai: 'UAI_A',
        schoolYearGroup: 'Terminale',
        competenceCode: '2.1',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        academieName: 'Nantes',
        provinceCode: '085',
        schoolUai: 'UAI_B',
        schoolYearGroup: 'Sixième',
        competenceCode: '2.1',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        academieName: 'Nantes',
        provinceCode: '085',
        schoolUai: 'UAI_B',
        schoolYearGroup: 'Terminale',
        competenceCode: '1.1',
      });
      await datamartBuilder.commit();

      // when
      const { models } = await findAll();

      // then
      expect(
        models.map(({ academieName, provinceCode, schoolUai, schoolYearGroup, competenceCode }) => ({
          academieName,
          provinceCode,
          schoolUai,
          schoolYearGroup,
          competenceCode,
        })),
      ).to.deep.equal([
        {
          academieName: 'Amiens',
          provinceCode: '080',
          schoolUai: 'UAI_B',
          schoolYearGroup: 'Terminale',
          competenceCode: '2.1',
        },
        {
          academieName: 'Nantes',
          provinceCode: '049',
          schoolUai: 'UAI_B',
          schoolYearGroup: 'Terminale',
          competenceCode: '2.1',
        },
        {
          academieName: 'Nantes',
          provinceCode: '085',
          schoolUai: 'UAI_A',
          schoolYearGroup: 'Terminale',
          competenceCode: '2.1',
        },
        {
          academieName: 'Nantes',
          provinceCode: '085',
          schoolUai: 'UAI_B',
          schoolYearGroup: 'Sixième',
          competenceCode: '2.1',
        },
        {
          academieName: 'Nantes',
          provinceCode: '085',
          schoolUai: 'UAI_B',
          schoolYearGroup: 'Terminale',
          competenceCode: '1.1',
        },
      ]);
      expect(models[0]).to.be.instanceOf(ParticipationDataset);
    });

    it('paginates results and returns correct meta', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI_A',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI_B',
      });
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI_C',
      });
      await datamartBuilder.commit();

      // when
      const { models, meta } = await findAll({ page: { number: 2, size: 2 } });

      // then
      expect(models).to.have.length(1);
      expect(models[0].schoolUai).to.equal('UAI_C');
      expect(meta).to.deep.equal({ page: 2, pageSize: 2, pageCount: 2 });
    });

    it('maps all columns to the domain model', async function () {
      // given
      datamartBuilder.factory.buildMenDashboardParticipationDataset({
        schoolUai: 'UAI001',
        schoolYear: 2025,
        academieName: 'Nantes',
        schoolName: 'Lycée Test',
        provinceCode: '085',
        schoolYearGroup: 'Terminale',
        competenceCode: '1.1',
        competenceName: 'Mener une recherche et une veille d’information',
        participantCount: 30,
        standardDeviation: 1.2,
        firstDecileLevel: 1,
        firstQuartileLevel: 2,
        medianLevel: 4,
        thirdQuartileLevel: 5,
        ninthDecileLevel: 6,
        averageMaxLevelReached: 4.2,
        averageMaxLevelReachable: 5,
        coverage: 0.85,
        updatedAt: '2026-07-01',
      });
      await datamartBuilder.commit();

      // when
      const { models } = await findAll();

      // then
      const stat = models[0];
      expect(stat.schoolUai).to.equal('UAI001');
      expect(stat.schoolYear).to.equal(2025);
      expect(stat.academieName).to.equal('Nantes');
      expect(stat.schoolName).to.equal('Lycée Test');
      expect(stat.provinceCode).to.equal('085');
      expect(stat.schoolYearGroup).to.equal('Terminale');
      expect(stat.competenceCode).to.equal('1.1');
      expect(stat.competenceName).to.equal('Mener une recherche et une veille d’information');
      expect(stat.participantCount).to.equal(30);
      expect(stat.standardDeviation).to.equal(1.2);
      expect(stat.firstDecileLevel).to.equal(1);
      expect(stat.firstQuartileLevel).to.equal(2);
      expect(stat.medianLevel).to.equal(4);
      expect(stat.thirdQuartileLevel).to.equal(5);
      expect(stat.ninthDecileLevel).to.equal(6);
      expect(stat.averageMaxLevelReached).to.equal(4.2);
      expect(stat.averageMaxLevelReachable).to.equal(5);
      expect(stat.coverage).to.equal(0.85);
      expect(stat.updatedAt).to.deep.equal('2026-07-01');
    });
  });
});
