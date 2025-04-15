import { datamartBuffer } from '../datamart-buffer.js';

const buildCertificationResult = function ({
  nationalStudentId,
  organizationUai,
  lastName,
  firstName,
  birthdate,
  status,
  pixScore,
  certificationDate,
  competenceCode,
  competenceName,
  competenceLevel,
  areaName,
} = {}) {
  const values = {
    national_student_id: nationalStudentId,
    organization_uai: organizationUai,
    last_name: lastName,
    first_name: firstName,
    birthdate,
    status,
    pix_score: pixScore,
    certification_date: certificationDate,
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
};

export { buildCertificationResult };
