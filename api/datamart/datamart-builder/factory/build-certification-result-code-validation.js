import { datamartBuffer } from '../datamart-buffer.js';

const buildCertificationResultCodeValidation = function ({
  verificationCode,
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
    certification_code_verification: verificationCode,
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
    tableName: 'certification_results',
    values,
  });
};

export { buildCertificationResultCodeValidation };
