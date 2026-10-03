import {
  certificationCourseIdGenerator,
  COMPETENCES,
  generateCompetenceLevel,
  generatePixScore,
  generateStatus,
  getCertificationDate,
  getCertificationIssuedAt,
  orgaUAIGenerator,
  verificationCodeGenerator,
} from '../tools.js';

const generateCertifCourseId = certificationCourseIdGenerator({ startingFrom: 2100000 });
const generateOrgaUai = orgaUAIGenerator();
const generateVerificationCode = verificationCodeGenerator({ startingFrom: 2100000 });

/**
 * A student that has a V3 certification and that can be found by UAI but not by INE
 */
export default function () {
  const orgaUAI = generateOrgaUai();
  const certification_date = getCertificationDate();
  const certification_issued_at = getCertificationIssuedAt(certification_date);
  const studentBase = {
    certification_courses_id: generateCertifCourseId(),
    certification_code_verification: generateVerificationCode(),
    organization_uai: orgaUAI,
    national_student_id: null, // We do not want it to be accessible by INE
    last_name: 'Famille' + orgaUAI,
    first_name: 'Prenom' + orgaUAI,
    birthdate: '1999-11-12',
    status: generateStatus(),
    pix_score: generatePixScore(),
    certification_date,
    certification_issued_at,
  };

  return COMPETENCES.map((competence) => ({
    ...studentBase,
    ...competence,
    competence_level: generateCompetenceLevel(),
  }));
}
