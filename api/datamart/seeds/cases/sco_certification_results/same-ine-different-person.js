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

const generateCertifCourseIdStudentOne = certificationCourseIdGenerator({ startingFrom: 3100000 });
const generateCertifCourseIdStudentTwo = certificationCourseIdGenerator({ startingFrom: 4100000 });
const generateINE = nationalStudentIdGenerator({ ineSuffix: 'CC' });
const generateOrgaUai = orgaUAIGenerator();
const generateVerificationCode = verificationCodeGenerator({ startingFrom: 4100000 });

/**
 * Two different students with the same INE
 */
export default function () {
  const sameINE = generateINE();
  let certification_date = getCertificationDate();
  let certification_issued_at = getCertificationIssuedAt(certification_date);
  const studentOneBase = {
    certification_courses_id: generateCertifCourseIdStudentOne(),
    certification_code_verification: generateVerificationCode(),
    organization_uai: generateOrgaUai(),
    national_student_id: sameINE,
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
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
    organization_uai: generateOrgaUai(),
    national_student_id: sameINE,
    last_name: faker.person.lastName(),
    first_name: generateFirstName(),
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
