import { datamartBuffer } from '../datamart-buffer.js';

export function buildScoCertificationResult({
  nationalStudentId,
  organizationUai,
  lastName,
  firstName,
  birthdate,
  status,
  pixScore,
  certificationId,
  certificationCodeVerification,
  certificationDate,
  certificationIssuedAt,
  maxReachableLevel,
  maxReachablePixScore,
  competenceCode,
  competenceName,
  competenceLevel,
  areaName,
}) {
  const values = {
    national_student_id: nationalStudentId,
    organization_uai: organizationUai,
    last_name: lastName,
    first_name: firstName,
    birthdate,
    status,
    pix_score: pixScore,
    certification_courses_id: certificationId,
    certification_code_verification: certificationCodeVerification,
    certification_issued_at: certificationIssuedAt,
    certification_date: certificationDate,
    max_reachable_level: maxReachableLevel,
    max_reachable_pix_score: maxReachablePixScore,
    competence_code: competenceCode,
    competence_name: competenceName,
    competence_level: competenceLevel,
    area_name: areaName,
  };

  datamartBuffer.pushInsertable({
    tableName: 'sco_certification_results',
    values,
  });

  return {
    nationalStudentId,
  };
}
