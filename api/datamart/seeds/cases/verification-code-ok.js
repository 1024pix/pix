import { faker } from '@faker-js/faker';

import {
  COMPETENCES,
  generateCertifCourseId,
  generateFirstName,
  generateStatus,
  generateVerificationCode,
  getFormattedBirthdate,
} from './tools.js';

/**
 * A person that has a certification not linked to an INE or UAI
 */
export default function () {
  const studentBase = {
    certification_courses_id: generateCertifCourseId(),
    certification_code_verification: generateVerificationCode(),
    organization_uai: null,
    national_student_id: null,
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
    birthdate: getFormattedBirthdate(),
    status: generateStatus(),
    pix_score: faker.number.int({ min: 48, max: 895 }),
    certification_date: faker.date.between({ from: '2024-01-01', to: '2024-11-04' }),
  };

  return COMPETENCES.map((competence) => ({
    ...studentBase,
    ...competence,
    competence_level: faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]),
  }));
}
