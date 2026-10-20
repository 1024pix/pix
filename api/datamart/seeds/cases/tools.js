import { faker } from '@faker-js/faker';

import { AssessmentResult } from '../../../src/shared/domain/models/AssessmentResult.js';

const COMPETENCES = [
  {
    competence_code: '1.1',
    competence_name: 'Mener une recherche et une veille d’information',
    area_name: '1. Information et données',
  },
  { competence_code: '1.2', competence_name: 'Gérer des données', area_name: '1. Information et données' },
  { competence_code: '1.3', competence_name: 'Traiter des données', area_name: '1. Information et données' },
  { competence_code: '2.1', competence_name: 'Interagir', area_name: '2. Communication et collaboration' },
  { competence_code: '2.2', competence_name: 'Partager et publier', area_name: '2. Communication et collaboration' },
  { competence_code: '2.3', competence_name: 'Collaborer', area_name: '2. Communication et collaboration' },
  {
    competence_code: '2.4',
    competence_name: 'S’insérer dans le monde numérique',
    area_name: '2. Communication et collaboration',
  },
  { competence_code: '3.1', competence_name: 'Développer des documents textuels', area_name: '3. Création de contenu' },
  {
    competence_code: '3.2',
    competence_name: 'Développer des documents multimedia',
    area_name: '3. Création de contenu',
  },
  {
    competence_code: '3.3',
    competence_name: 'Adapter les documents à leur finalité',
    area_name: '3. Création de contenu',
  },
  { competence_code: '3.4', competence_name: 'Programmer', area_name: '3. Création de contenu' },
  {
    competence_code: '4.1',
    competence_name: 'Sécuriser l’environnement numérique',
    area_name: '4. Protection et sécurité',
  },
  {
    competence_code: '4.2',
    competence_name: 'Protéger les données personnelles et la vie privée',
    area_name: '4. Protection et sécurité',
  },
  {
    competence_code: '4.3',
    competence_name: 'Protéger la santé, le bien-être et l’environnement',
    area_name: '4. Protection et sécurité',
  },
  {
    competence_code: '5.1',
    competence_name: 'Résoudre des problèmes techniques',
    area_name: '5. Environnement numérique',
  },
  {
    competence_code: '5.2',
    competence_name: 'Construire un environnement numérique',
    area_name: '5. Environnement numérique',
  },
];

const incrementalGenerator = function* (startingFrom = 100000000) {
  let i = startingFrom;
  while (true) {
    yield i++;
  }
};

const orgaUAIGenerator = ({ startingFrom = 0 } = {}) => {
  const uaiGenerator = incrementalGenerator(startingFrom);
  return () => 'UAI' + uaiGenerator.next().value;
};

/**
 * @param {Object} params
 * @param {number} params.[startingFrom] INE generated will start from given value
 * @param {number} params.[ineSuffix] every generated INE will end with this suffix
 */
const nationalStudentIdGenerator = ({ startingFrom = 100000000, ineSuffix = 'xx' } = {}) => {
  const ineGenerator = incrementalGenerator(startingFrom);
  return () => ineGenerator.next().value + ineSuffix;
};

// Eight characters only for the verification code
const verificationCodeGenerator = ({ startingFrom = 10000000 } = {}) => {
  const verificationCodeGenerator = incrementalGenerator(startingFrom);
  return () => 'P-' + verificationCodeGenerator.next().value;
};

const generateFirstName = () => {
  return faker.person.firstName() + faker.helpers.arrayElement(['', '-élise', '-François']);
};

const getFormattedBirthdate = () => {
  const birthdate = faker.date.birthdate({ min: 13, max: 44, mode: 'age' });
  return birthdate.toISOString().split('T')[0]; // Format "YYYY-MM-DD"
};

const getCertificationDate = () => {
  // V3 certifications start after 04/11/2024
  return faker.date.between({ from: '2024-11-04', to: new Date() });
};

const getCertificationIssuedAt = (after) => {
  return faker.date.between({ from: after, to: new Date() });
};

const generateStatus = () => {
  return faker.helpers.arrayElement([
    AssessmentResult.status.CANCELLED,
    AssessmentResult.status.REJECTED,
    AssessmentResult.status.VALIDATED,
  ]);
};

const certificationCourseIdGenerator = ({ startingFrom = 1000 }) => {
  const certifCourseIdGenerator = incrementalGenerator(startingFrom);
  return () => certifCourseIdGenerator.next().value;
};

const generateCompetenceLevel = () => {
  return faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]);
};

const generatePixScore = () => {
  return faker.number.int({ min: 48, max: 895 });
};

const chunkify = async ({ numberOfSeeds, knex, datamart, generateFn }) => {
  const chunkSize = 100;
  let remaining = numberOfSeeds;
  do {
    await knex.batchInsert(datamart, faker.helpers.multiple(generateFn, { count: chunkSize }).flat());
    remaining = remaining - chunkSize;
  } while (remaining / chunkSize >= 1);
};

export {
  certificationCourseIdGenerator,
  chunkify,
  COMPETENCES,
  generateCompetenceLevel,
  generateFirstName,
  generatePixScore,
  generateStatus,
  getCertificationDate,
  getCertificationIssuedAt,
  getFormattedBirthdate,
  nationalStudentIdGenerator,
  orgaUAIGenerator,
  verificationCodeGenerator,
};
