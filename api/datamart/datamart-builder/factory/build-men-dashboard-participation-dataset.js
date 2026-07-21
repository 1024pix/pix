import { datamartBuffer } from '../datamart-buffer.js';

const buildMenDashboardParticipationDataset = function ({
  schoolUai = 'UAI001',
  schoolYear = 2025,
  academieName = 'Paris',
  schoolName = 'Lycée Test',
  provinceCode = '075',
  schoolYearGroup = 'Terminale',
  competenceCode = '1.1',
  competenceName = 'Mener une recherche et une veille d’information',
  participantCount = 30,
  standardDeviation = 1.2,
  firstDecileLevel = 1,
  firstQuartileLevel = 2,
  medianLevel = 4,
  thirdQuartileLevel = 5,
  ninthDecileLevel = 6,
  averageMaxLevelReached = 4.2,
  averageMaxLevelReachable = 5,
  coverage = 0.85,
  updatedAt = new Date('2026-07-01'),
} = {}) {
  const values = {
    schoolUai,
    schoolYear,
    academieName,
    schoolName,
    provinceCode,
    schoolYearGroup,
    competenceCode,
    competenceName,
    participantCount,
    standardDeviation,
    firstDecileLevel,
    firstQuartileLevel,
    medianLevel,
    thirdQuartileLevel,
    ninthDecileLevel,
    averageMaxLevelReached,
    averageMaxLevelReachable,
    coverage,
    updatedAt,
  };

  datamartBuffer.pushInsertable({
    tableName: 'men_dashboard_participation_dataset',
    values,
  });

  return values;
};

export { buildMenDashboardParticipationDataset };
