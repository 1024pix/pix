import { faker } from '@faker-js/faker';

import { COMPETENCES, generateCertifCourseId, generateStatus } from './tools.js';

/**
 * A student that has multiple accents in its first name and last name
 */
export default function () {
  const accentStudent = () => {
    const studentBase = {
      certification_courses_id: generateCertifCourseId(),
      organization_uai: 'UAIACCENT',
      national_student_id: null,
      last_name: 'Aïme Trôp Lé Accents',
      first_name: 'Jérôme',
      birthdate: '2000-01-01',
      status: generateStatus(),
      pix_score: faker.number.int({ min: 48, max: 895 }),
      certification_date: faker.date.between({ from: '2024-01-01', to: '2024-11-04' }),
    };

    return COMPETENCES.map((competence) => ({
      ...studentBase,
      ...competence,
      competence_level: faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]),
    }));
  };

  const doubleDashStudent = () => {
    const studentBase = {
      certification_courses_id: generateCertifCourseId(),
      organization_uai: 'UAIDOUBLE',
      national_student_id: null,
      last_name: 'Double Dash',
      first_name: 'Anne--Marie',
      birthdate: '2000-01-01',
      status: generateStatus(),
      pix_score: faker.number.int({ min: 48, max: 895 }),
      certification_date: faker.date.between({ from: '2024-01-01', to: '2024-11-04' }),
    };

    return COMPETENCES.map((competence) => ({
      ...studentBase,
      ...competence,
      competence_level: faker.helpers.arrayElement([1, 2, 3, 4, 5, 6, 7]),
    }));
  };

  return [...accentStudent(), ...doubleDashStudent()];
}
