import { databaseBuffer } from '../database-buffer.js';

const buildCertificationCpfCity = function ({
  id = databaseBuffer.getNextId(),
  name = 'PARIS 19',
  postalCode = '75019',
  INSEECode = '75119',
  isActualName = true,
} = {}) {
  const values = {
    id,
    name,
    postalCode,
    INSEECode,
    isActualName,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'certification-cpf-cities',
    values,
  });
};

export { buildCertificationCpfCity };
