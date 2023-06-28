import { Competence } from '../response-objects/Competence.js';
import { buildArea as buildAreaForLS } from './build-area-for-ls.js';

const buildCompetenceForLS = function ({ id, name, area = buildAreaForLS() } = {}) {
  return new Competence({
    id,
    name,
    area,
  });
};

export { buildCompetenceForLS };
