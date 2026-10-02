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
  verificationCodeGenerator,
} from '../tools.js';

const generateCertifCourseId = certificationCourseIdGenerator({ startingFrom: 1000000 });
const generateVerificationCode = verificationCodeGenerator({ startingFrom: 10000000 });

/**
 * A person that has a certification not linked to an INE or UAI
 */
export default function () {
  const studentBase = {
    certification_courses_id: generateCertifCourseId(),
    certification_code_verification: generateVerificationCode(),
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
