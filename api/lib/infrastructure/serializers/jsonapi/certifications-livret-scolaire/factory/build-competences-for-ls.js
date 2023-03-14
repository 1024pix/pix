import { Competence } from '../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/response-objects/Competence.js';
import { buildArea as buildAreaForLS } from '../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/factory/build-area-for-ls.js';

const buildCompetenceForLS = function ({ id, name, area = buildAreaForLS() } = {}) {
  return new Competence({
    id,
    name,
    area,
  });
};

export { buildCompetenceForLS };
