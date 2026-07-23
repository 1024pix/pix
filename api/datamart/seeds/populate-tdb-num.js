import { DatamartBuilder } from '../../datamart/datamart-builder/datamart-builder.js';

// Deterministic per-competence variation factor allows to have various avgPixScore
const COMPETENCES = [
  { code: '1.1', name: 'Mener une recherche et une veille d’information', variation: 1.0 },
  { code: '1.2', name: 'Gérer des données', variation: 0.92 },
  { code: '1.3', name: 'Traiter des données', variation: 1.08 },
  { code: '2.1', name: 'Interagir', variation: 0.88 },
  { code: '2.2', name: 'Partager et publier', variation: 1.03 },
  { code: '2.3', name: 'Collaborer', variation: 0.97 },
  { code: '2.4', name: 'S’insérer dans le monde numérique', variation: 1.05 },
  { code: '3.1', name: 'Développer des documents textuels', variation: 0.93 },
  { code: '3.2', name: 'Développer des documents multimedia', variation: 1.07 },
  { code: '3.3', name: 'Adapter les documents à leur finalité', variation: 0.99 },
  { code: '3.4', name: 'Programmer', variation: 0.95 },
  { code: '4.1', name: 'Sécuriser l’environnement numérique', variation: 1.04 },
  { code: '4.2', name: 'Protéger les données personnelles et la vie privée', variation: 0.9 },
  { code: '4.3', name: 'Protéger la santé, le bien-être et l’environnement', variation: 1.02 },
  { code: '5.1', name: 'Résoudre des problèmes techniques', variation: 0.96 },
  { code: '5.2', name: 'Construire un environnement numérique', variation: 1.01 },
];

function roundTo(value, precision) {
  return Math.round(value * precision) / precision;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scoreToLevel(pixScore) {
  return roundTo(1 + ((pixScore - 1) / 895) * 6, 10);
}

function computeCompetenceLevelStats({ basePixScore, variation }) {
  const averagePixScore = clamp(roundTo(basePixScore * variation, 1), 1, 896);
  const avgCompetenceLevel = clamp(scoreToLevel(averagePixScore), 1, 7);

  return { averagePixScore, avgCompetenceLevel };
}

function computeParticipationLevelStats(avgCompetenceLevel) {
  const medianLevel = clamp(roundTo(avgCompetenceLevel, 1), 1, 6);
  const averageMaxLevelReached = clamp(roundTo(avgCompetenceLevel, 10), 1, 6);
  const averageMaxLevelReachable = clamp(roundTo(averageMaxLevelReached + 0.5, 10), 1, 6);

  return {
    firstDecileLevel: clamp(medianLevel - 2, 1, 6),
    firstQuartileLevel: clamp(medianLevel - 1, 1, 6),
    medianLevel,
    thirdQuartileLevel: clamp(medianLevel + 1, 1, 6),
    ninthDecileLevel: clamp(medianLevel + 2, 1, 6),
    averageMaxLevelReached,
    averageMaxLevelReachable,
    coverage: clamp(roundTo(averageMaxLevelReached / averageMaxLevelReachable, 100), 0, 1),
  };
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
  const schoolYear = 2025;
  const updatedAt = new Date('2026-07-01');

  const certificationRecords = [];
  const participationRecords = [];

  COMPETENCES.forEach(({ code: competenceCode, name: competenceName, variation }) => {
    const { averagePixScore, avgCompetenceLevel } = computeCompetenceLevelStats({ basePixScore, variation });

    certificationRecords.push({
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
    });

    participationRecords.push({
      schoolUai,
      schoolYear,
      academieName,
      schoolName,
      provinceCode,
      schoolYearGroup,
      competenceCode,
      competenceName,
      participantCount: certificationCount,
      standardDeviation: clamp(roundTo(2 - variation, 10), 0.5, 2),
      ...computeParticipationLevelStats(avgCompetenceLevel),
      updatedAt,
    });
  });

  return { certificationRecords, participationRecords };
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
      const { certificationRecords, participationRecords } = generateSchoolClassRecords({
        schoolUai: school.schoolUai,
        academieName: school.academieName,
        schoolName: school.schoolName,
        provinceCode: school.provinceCode,
        schoolYearGroup: cls.schoolYearGroup,
        basePixScore: cls.basePixScore,
        certificationCount: cls.certificationCount,
        validatedCertificationCount: cls.validatedCertificationCount,
      });
      certificationRecords.forEach((record) => datamartBuilder.factory.buildMenDashboardCertificationDataset(record));
      participationRecords.forEach((record) => datamartBuilder.factory.buildMenDashboardParticipationDataset(record));
    }
  }

  await datamartBuilder.commit();
}
