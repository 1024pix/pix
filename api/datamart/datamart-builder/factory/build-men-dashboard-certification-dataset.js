import { datamartBuffer } from '../datamart-buffer.js';

const buildMenDashboardCertificationDataset = function ({
  schoolUai = 'UAI001',
  schoolYear = 2025,
  academieName = 'Paris',
  schoolName = 'Lycée Test',
  provinceCode = '075',
  schoolYearGroup = 'Terminale',
  validatedCertificationCount = 10,
  certificationCount = 15,
  averagePixScore = 350.5,
  competenceCode = '1.1',
  avgCompetenceLevel = 3.2,
  updatedAt = new Date('2026-07-01'),
} = {}) {
  const values = {
    schoolUai,
    schoolYear,
    academieName,
    schoolName,
    provinceCode,
    schoolYearGroup,
    validatedCertificationCount,
    certificationCount,
    averagePixScore,
    competenceCode,
    avgCompetenceLevel,
    updatedAt,
  };

  datamartBuffer.pushInsertable({
    tableName: 'men_dashboard_certification_dataset',
    values,
  });

  return values;
};

export { buildMenDashboardCertificationDataset };
