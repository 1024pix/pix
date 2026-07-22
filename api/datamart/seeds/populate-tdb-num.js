import { DatamartBuilder } from '../../datamart/datamart-builder/datamart-builder.js';

const COMPETENCE_CODES = [
  '1.1',
  '1.2',
  '1.3',
  '2.1',
  '2.2',
  '2.3',
  '2.4',
  '3.1',
  '3.2',
  '3.3',
  '3.4',
  '4.1',
  '4.2',
  '4.3',
  '5.1',
  '5.2',
];

// Deterministic per-competence variation factors (index matches COMPETENCE_CODES)
// Allows to have various avgPixScore
const COMPETENCE_VARIATIONS = [
  1.0, 0.92, 1.08, 0.88, 1.03, 0.97, 1.05, 0.93, 1.07, 0.99, 0.95, 1.04, 0.9, 1.02, 0.96, 1.01,
];

function scoreToLevel(pixScore) {
  return Math.round((1 + ((pixScore - 1) / 895) * 6) * 10) / 10;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function generateSchoolClassRecords({
  schoolUai,
  academieName,
  schoolName,
  provinceCode,
  schoolYearGroup,
  basePixScore,
  certificationCount,
  validatedCertificationCount,
}) {
  return COMPETENCE_CODES.map((competenceCode, index) => {
    const averagePixScore = clamp(Math.round(basePixScore * COMPETENCE_VARIATIONS[index]), 1, 896);
    const avgCompetenceLevel = clamp(scoreToLevel(averagePixScore), 1, 7);

    return {
      schoolUai,
      schoolYear: 2025,
      academieName,
      schoolName,
      provinceCode,
      schoolYearGroup,
      validatedCertificationCount,
      certificationCount,
      averagePixScore,
      competenceCode,
      avgCompetenceLevel,
      updatedAt: new Date('2026-07-01'),
    };
  });
}

const SCHOOLS = [
  {
    schoolUai: '0311234A',
    academieName: 'Toulouse',
    schoolName: 'Collège Jean Jaurès',
    provinceCode: '031',
    classes: [
      // 3ème obligatoire
      {
        schoolYearGroup: '3ème',
        basePixScore: 250,
        certificationCount: 45,
        validatedCertificationCount: 32,
      },
    ],
  },
  {
    schoolUai: '0319876B',
    academieName: 'Toulouse',
    schoolName: 'Lycée Pierre de Fermat',
    provinceCode: '031',
    classes: [
      // Terminale obligatoire + 1ère optionnelle
      {
        schoolYearGroup: 'Terminale',
        basePixScore: 620,
        certificationCount: 180,
        validatedCertificationCount: 158,
      },
      {
        schoolYearGroup: '1ère',
        basePixScore: 500,
        certificationCount: 160,
        validatedCertificationCount: 131,
      },
    ],
  },
  {
    schoolUai: '0812345C',
    academieName: 'Toulouse',
    schoolName: 'Collège Jean Moulin',
    provinceCode: '081',
    classes: [
      {
        schoolYearGroup: '3ème',
        basePixScore: 300,
        certificationCount: 52,
        validatedCertificationCount: 39,
      },
      {
        schoolYearGroup: '4ème',
        basePixScore: 190,
        certificationCount: 48,
        validatedCertificationCount: 30,
      },
    ],
  },
  {
    schoolUai: '0351111D',
    academieName: 'Rennes',
    schoolName: 'Collège Anne de Bretagne',
    provinceCode: '035',
    classes: [
      {
        schoolYearGroup: '3ème',
        basePixScore: 320,
        certificationCount: 60,
        validatedCertificationCount: 47,
      },
      {
        schoolYearGroup: '5ème',
        basePixScore: 115,
        certificationCount: 58,
        validatedCertificationCount: 31,
      },
    ],
  },
  {
    schoolUai: '0352222E',
    academieName: 'Rennes',
    schoolName: 'Lycée Émile Zola',
    provinceCode: '035',
    classes: [
      {
        schoolYearGroup: 'Terminale',
        basePixScore: 480,
        certificationCount: 140,
        validatedCertificationCount: 119,
      },
    ],
  },
  {
    schoolUai: '0292222F',
    academieName: 'Rennes',
    schoolName: 'Collège La Recouvrance',
    provinceCode: '029',
    classes: [
      {
        schoolYearGroup: '3ème',
        basePixScore: 175,
        certificationCount: 35,
        validatedCertificationCount: 21,
      },
    ],
  },
  {
    schoolUai: '0871234G',
    academieName: 'Limoges',
    schoolName: 'Collège La Borie',
    provinceCode: '087',
    classes: [
      {
        schoolYearGroup: '3ème',
        basePixScore: 390,
        certificationCount: 50,
        validatedCertificationCount: 40,
      },
    ],
  },
  {
    schoolUai: '0879876H',
    academieName: 'Limoges',
    schoolName: 'Lycée Gay-Lussac',
    provinceCode: '087',
    classes: [
      {
        schoolYearGroup: 'Terminale',
        basePixScore: 550,
        certificationCount: 120,
        validatedCertificationCount: 104,
      },
      {
        schoolYearGroup: '1ère',
        basePixScore: 430,
        certificationCount: 110,
        validatedCertificationCount: 87,
      },
    ],
  },
  {
    schoolUai: '0231234I',
    academieName: 'Limoges',
    schoolName: 'Collège du Vallon',
    provinceCode: '023',
    classes: [
      {
        schoolYearGroup: '3ème',
        basePixScore: 210,
        certificationCount: 28,
        validatedCertificationCount: 18,
      },
    ],
  },
];

export async function seed(knex) {
  const datamartBuilder = new DatamartBuilder({ knex });

  for (const school of SCHOOLS) {
    for (const cls of school.classes) {
      const records = generateSchoolClassRecords({
        schoolUai: school.schoolUai,
        academieName: school.academieName,
        schoolName: school.schoolName,
        provinceCode: school.provinceCode,
        schoolYearGroup: cls.schoolYearGroup,
        basePixScore: cls.basePixScore,
        certificationCount: cls.certificationCount,
        validatedCertificationCount: cls.validatedCertificationCount,
      });
      records.forEach((record) => datamartBuilder.factory.buildMenDashboardCertificationDataset(record));
    }
  }

  await datamartBuilder.commit();
}
