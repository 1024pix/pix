import {
  certificationCourseIdGenerator,
  COMPETENCES,
  generateCompetenceLevel,
  generatePixScore,
  generateStatus,
  getCertificationDate,
  orgaUAIGenerator,
} from '../tools.js';

const generateCertifCourseId = certificationCourseIdGenerator({ startingFrom: 2100000 });
const generateOrgaUai = orgaUAIGenerator();

/**
 * A student that has a V3 certification and that can be found by UAI but not by INE
 */
export default function () {
  const orgaUAI = generateOrgaUai();

  const studentBase = {
    certification_courses_id: generateCertifCourseId(),
    organization_uai: orgaUAI,
    national_student_id: null, // We do not want it to be accessible by INE
    last_name: 'Famille' + orgaUAI,
    first_name: 'Prenom' + orgaUAI,
    birthdate: '1999-11-12',
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
