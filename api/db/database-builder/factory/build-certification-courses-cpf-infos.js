import { databaseBuffer } from '../database-buffer.js';

const buildCertificationCoursesCpfInfos = function ({
  certificationCourseId = null,
  filename = null,
  importStatus = null,
} = {}) {
  const values = {
    certificationCourseId,
    filename,
    importStatus,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-courses-cpf-infos',
    values,
  });
};

export { buildCertificationCoursesCpfInfos };
