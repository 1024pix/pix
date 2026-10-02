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
  orgaUAIGenerator,
} from '../tools.js';

const generateCertifCourseIdStudentOne = certificationCourseIdGenerator({ startingFrom: 3100000 });
const generateCertifCourseIdStudentTwo = certificationCourseIdGenerator({ startingFrom: 4100000 });
const generateINE = nationalStudentIdGenerator({ ineSuffix: 'CC' });
const generateOrgaUai = orgaUAIGenerator();

/**
 * Two different students with the same INE
 */
export default function () {
  const sameINE = generateINE();

  const studentOneBase = {
    certification_courses_id: generateCertifCourseIdStudentOne(),
    organization_uai: generateOrgaUai(),
    national_student_id: sameINE,
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
    birthdate: getFormattedBirthdate(), // We want different birthdate
    status: generateStatus(),
    pix_score: generatePixScore(),
    certification_date: getCertificationDate(),
  };

  const studentTwoBase = {
    certification_courses_id: generateCertifCourseIdStudentTwo(),
    organization_uai: generateOrgaUai(),
    national_student_id: sameINE,
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
    birthdate: getFormattedBirthdate(), // We want different birthdate
    status: generateStatus(),
    pix_score: generatePixScore(),
    certification_date: getCertificationDate(),
  };

  return [studentOneBase, studentTwoBase].flatMap((student) => {
    return COMPETENCES.map((competence) => ({
      ...student,
      ...competence,
      competence_level: generateCompetenceLevel(),
    }));
  });
}
