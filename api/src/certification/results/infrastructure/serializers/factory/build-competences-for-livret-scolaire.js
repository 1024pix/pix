import { Competence } from '../response-objects/Competence.js';
import { buildArea as buildAreaForLivretScolaire } from './build-area-for-livret-scolaire.js';

const buildCompetenceForLivretScolaire = function ({ id, name, area = buildAreaForLivretScolaire() } = {}) {
  return new Competence({
    id,
    name,
    area,
  });
};

export { buildCompetenceForLivretScolaire };
