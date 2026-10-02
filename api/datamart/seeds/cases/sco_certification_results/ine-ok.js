import { faker } from '@faker-js/faker';

import {
  certificationCourseIdGenerator,
  COMPETENCES,
  generateCompetenceLevel,
  generateFirstName,
  generatePixScore,
  generateStatus,
  getCertificationDate,
  getFormattedBirthdate,
  nationalStudentIdGenerator,
} from '../tools.js';

const generateCertifCourseId = certificationCourseIdGenerator({ startingFrom: 1100000 });
const generateINE = nationalStudentIdGenerator({ ineSuffix: 'AA' });

/**
 * A student that has a V3 certification and that can be found by INE but not by UAI
 */
export default function () {
  const studentBase = {
    certification_courses_id: generateCertifCourseId(),
    organization_uai: null, // We do not want it to be accessible by UAI
    national_student_id: generateINE(),
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
    birthdate: getFormattedBirthdate(),
    status: generateStatus(),
    pix_score: generatePixScore(),
    certification_date: getCertificationDate(),
  };

  return COMPETENCES.map((competence) => ({
    ...studentBase,
    ...competence,
    competence_level: generateCompetenceLevel(),
  }));
}
