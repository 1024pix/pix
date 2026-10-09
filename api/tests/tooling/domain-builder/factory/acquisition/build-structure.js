import { Structure } from '../../../../../src/organizational-entities/domain/models/Structure.js';

const buildStructure = function ({ id = 1234, organizationId, certificationCenterId, categoryId } = {}) {
  return new Structure({ id, organizationId, certificationCenterId, categoryId });
};

export { buildStructure };
