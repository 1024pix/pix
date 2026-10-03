import { datamartBuffer } from '../datamart-buffer.js';
// TODO rename me buildCertificationResult or buildParcourSupCertificationResult (renaming the tables in maddo would be amazing as well)
const buildCertificationResultCodeValidation = function ({
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
    certification_code_verification: certificationCodeVerification,
    last_name: lastName,
    first_name: firstName,
    birthdate,
    status,
    pix_score: pixScore,
    certification_courses_id: certificationId,
    certification_date: certificationDate,
    certification_issued_at: certificationIssuedAt,
    max_reachable_level: maxReachableLevel,
    max_reachable_pix_score: maxReachablePixScore,
    competence_code: competenceCode,
    competence_name: competenceName,
    competence_level: competenceLevel,
    area_name: areaName,
  };

  datamartBuffer.pushInsertable({
    tableName: 'certification_results',
    values,
  });
};

export { buildCertificationResultCodeValidation };
