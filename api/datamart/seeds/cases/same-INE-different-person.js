import { faker } from '@faker-js/faker';

import {
  COMPETENCES,
  generateCertifCourseId,
  generateFirstName,
  generateNationalStudentId,
  generateOrgaUai,
  generateStatus,
  getFormattedBirthdate,
} from './tools.js';

/**
 * Same student but birthdates different
 */
export default function () {
  const INE = generateNationalStudentId('CC');

  const studentOneBase = {
    certification_courses_id: generateCertifCourseId(),
    organization_uai: generateOrgaUai(),
    national_student_id: INE,
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
    birthdate: getFormattedBirthdate(), // We want different birthdate
    status: generateStatus(),
    pix_score: faker.number.int({ min: 48, max: 895 }),
    certification_date: faker.date.between({ from: '2024-01-01', to: '2024-11-04' }),
  };

  const studentTwoBase = {
    certification_courses_id: generateCertifCourseId(),
    organization_uai: generateOrgaUai(),
    national_student_id: INE,
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
    birthdate: getFormattedBirthdate(), // We want different birthdate
    status: generateStatus(),
    pix_score: faker.number.int({ min: 48, max: 895 }),
    certification_date: faker.date.between({ from: '2024-01-01', to: '2024-11-04' }),
  };

  return [
    COMPETENCES.map((competence) => ({
      ...studentOneBase,
      ...competence,
      competence_level: faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]),
    })),
    COMPETENCES.map((competence) => ({
      ...studentTwoBase,
      ...competence,
      competence_level: faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]),
    })),
  ].flat();
}
