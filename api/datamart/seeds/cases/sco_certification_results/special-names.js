import {
  certificationCourseIdGenerator,
  COMPETENCES,
  generateCompetenceLevel,
  generatePixScore,
  generateStatus,
  getCertificationDate,
} from '../tools.js';

const generateCertifCourseId = certificationCourseIdGenerator({ startingFrom: 8100000 });

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
      pix_score: generatePixScore(),
      certification_date: getCertificationDate(),
    };

    return COMPETENCES.map((competence) => ({
      ...studentBase,
      ...competence,
      competence_level: generateCompetenceLevel(),
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
      pix_score: generatePixScore(),
      certification_date: getCertificationDate(),
    };

    return COMPETENCES.map((competence) => ({
      ...studentBase,
      ...competence,
      competence_level: generateCompetenceLevel(),
    }));
  };

  return [...accentStudent(), ...doubleDashStudent()];
}
