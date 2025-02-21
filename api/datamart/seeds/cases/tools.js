import { faker } from '@faker-js/faker';

import { AssessmentResult } from '../../../src/shared/domain/models/index.js';

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

const uaiGenerator = (function* () {
  let i = 1;
  while (true) {
    yield ++i;
  }
})();
const generateOrgaUai = () => {
  return 'UAI' + uaiGenerator.next().value;
};

const ineGenerator = (function* () {
  let i = 100000000;
  while (true) {
    yield ++i;
  }
})();
const generateNationalStudentId = (suffix) => {
  return ineGenerator.next().value + suffix;
};

const verificationCodeGenerator = (function* () {
  let i = 10000000;
  while (true) {
    yield ++i;
  }
})();
const generateVerificationCode = () => {
  return 'P-' + verificationCodeGenerator.next().value;
};

const generateFirstName = () => {
  return faker.person.firstName() + faker.helpers.arrayElement(['', '-élise', '-François']);
};

const getFormattedBirthdate = () => {
  const birthdate = faker.date.birthdate({ min: 13, max: 44, mode: 'age' });
  return birthdate.toISOString().split('T')[0]; // Format "YYYY-MM-DD"
};

const generateStatus = () => {
  return faker.helpers.arrayElement(Object.values(AssessmentResult.status));
};

const generateCertifCourseId = () => {
  return Date.now() + faker.number.int(10);
};

export {
  COMPETENCES,
  generateCertifCourseId,
  generateFirstName,
  generateNationalStudentId,
  generateOrgaUai,
  generateStatus,
  generateVerificationCode,
  getFormattedBirthdate,
};
