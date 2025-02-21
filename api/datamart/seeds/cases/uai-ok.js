import { faker } from '@faker-js/faker';

import { COMPETENCES, generateCertifCourseId, generateFirstName, generateOrgaUai, generateStatus, getFormattedBirthdate } from './tools.js';

/**
 * A student that has a V3 certification and that can be found by UAI but not by INE
 */
export default function () {
  const studentBase = {
    certification_courses_id: generateCertifCourseId(),
    organization_uai: generateOrgaUai(),
    national_student_id: null, // We do not want it to be accessible by INE
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
