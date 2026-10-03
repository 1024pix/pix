import { faker } from '@faker-js/faker';

import {
  certificationCourseIdGenerator,
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
} from '../tools.js';

const generateCertifCourseIdStudentOne = certificationCourseIdGenerator({ startingFrom: 5100000 });
const generateCertifCourseIdStudentTwo = certificationCourseIdGenerator({ startingFrom: 6100000 });
const generateINE = nationalStudentIdGenerator({ ineSuffix: 'BB' });
const generateOrgaUai = orgaUAIGenerator();
const generateVerificationCode = verificationCodeGenerator({ startingFrom: 6100000 });

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
  let certification_date = getCertificationDate();
  let certification_issued_at = getCertificationIssuedAt(certification_date);

  const studentOneBase = {
    certification_courses_id: generateCertifCourseIdStudentOne(),
    certification_code_verification: generateVerificationCode(),
    organization_uai: sameUAI,
    national_student_id: sameINE,
    last_name: sameLastName,
    first_name: sameFirstName,
    birthdate: getFormattedBirthdate(), // We want different birthdate
    status: generateStatus(),
    pix_score: generatePixScore(),
    certification_date,
    certification_issued_at,
  };

  certification_date = getCertificationDate();
  certification_issued_at = getCertificationIssuedAt(certification_date);
  const studentTwoBase = {
    certification_courses_id: generateCertifCourseIdStudentTwo(),
    certification_code_verification: generateVerificationCode(),
    organization_uai: sameUAI,
    national_student_id: sameINE,
    last_name: sameLastName,
    first_name: sameFirstName,
    birthdate: getFormattedBirthdate(), // We want different birthdate
    status: generateStatus(),
    pix_score: generatePixScore(),
    certification_date,
    certification_issued_at,
  };

  return [studentOneBase, studentTwoBase].flatMap((student) => {
    return COMPETENCES.map((competence) => ({
      ...student,
      ...competence,
      competence_level: generateCompetenceLevel(),
    }));
  });
}
