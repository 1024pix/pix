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

const generateCertifCourseIdStudentOne = certificationCourseIdGenerator({ startingFrom: 5100000 });
const generateCertifCourseIdStudentTwo = certificationCourseIdGenerator({ startingFrom: 6100000 });
const generateINE = nationalStudentIdGenerator({ ineSuffix: 'BB' });
const generateOrgaUai = orgaUAIGenerator();

/**
 * Some student have obtained a Pix certification, but with different birthdates
 * This generates a conflict when looking for a student's certification by INE (one result possible)
 * The birthdate is one of the three elements that identifies a student
 */
export default function () {
  const sameINE = generateINE();
  const sameUAI = generateOrgaUai();
  const sameFirstName = generateFirstName();
  const sameLastName = faker.person.lastName();

  const studentOneBase = {
    certification_courses_id: generateCertifCourseIdStudentOne(),
    organization_uai: sameUAI,
    national_student_id: sameINE,
    last_name: sameLastName,
    first_name: sameFirstName,
    birthdate: getFormattedBirthdate(), // We want different birthdate
    status: generateStatus(),
    pix_score: generatePixScore(),
    certification_date: getCertificationDate(),
  };

  const studentTwoBase = {
    certification_courses_id: generateCertifCourseIdStudentTwo(),
    organization_uai: sameUAI,
    national_student_id: sameINE,
    last_name: sameLastName,
    first_name: sameFirstName,
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
