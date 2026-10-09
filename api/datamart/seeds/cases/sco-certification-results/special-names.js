import {
  certificationCourseIdGenerator,
  COMPETENCES,
  generateCompetenceLevel,
  generatePixScore,
  generateStatus,
  getCertificationDate,
  getCertificationIssuedAt,
  verificationCodeGenerator,
} from '../tools.js';

const generateCertifCourseId = certificationCourseIdGenerator({ startingFrom: 8100000 });
const generateVerificationCode = verificationCodeGenerator({ startingFrom: 8100000 });

/**
 * A student that has multiple accents in its first name and last name
 */
export default function () {
  const accentStudent = () => {
    const certification_date = getCertificationDate();
    const certification_issued_at = getCertificationIssuedAt(certification_date);
    const studentBase = {
      certification_courses_id: generateCertifCourseId(),
      certification_code_verification: generateVerificationCode(),
      organization_uai: 'UAIACCENT',
      national_student_id: null,
      last_name: 'Aïme Trôp Lé Accents',
      first_name: 'Jérôme',
      birthdate: '2000-01-01',
      status: generateStatus(),
      pix_score: generatePixScore(),
      certification_date,
      certification_issued_at,
      max_reachable_level: 7,
      max_reachable_pix_score: 895,
    };

    return COMPETENCES.map((competence) => ({
      ...studentBase,
      ...competence,
      competence_level: generateCompetenceLevel(),
    }));
  };

  const doubleDashStudent = () => {
    const certification_date = getCertificationDate();
    const certification_issued_at = getCertificationIssuedAt(certification_date);
    const studentBase = {
      certification_courses_id: generateCertifCourseId(),
      certification_code_verification: generateVerificationCode(),
      organization_uai: 'UAIDOUBLE',
      national_student_id: null,
      last_name: 'Double Dash',
      first_name: 'Anne--Marie',
      birthdate: '2000-01-01',
      status: generateStatus(),
      pix_score: generatePixScore(),
      certification_date,
      certification_issued_at,
      max_reachable_level: 7,
      max_reachable_pix_score: 895,
    };

    return COMPETENCES.map((competence) => ({
      ...studentBase,
      ...competence,
      competence_level: generateCompetenceLevel(),
    }));
  };

  return [...accentStudent(), ...doubleDashStudent()];
}
