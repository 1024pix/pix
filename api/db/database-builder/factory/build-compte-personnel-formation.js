import { databaseBuffer } from '../database-buffer.js';

const buildComptePersonnelFormation = function ({
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
    tableName: 'compte-personnel-formation',
    values,
  });
};

export { buildComptePersonnelFormation };
